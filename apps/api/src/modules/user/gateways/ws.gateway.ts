import { Injectable, UsePipes, UseFilters, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import Redis from 'ioredis';
import { pick, isNil } from 'lodash';
import WebSocket, { Server } from 'ws';

import { WsPipe, WsExceptionFilter } from '@/modules/core/providers';
import { RedisService } from '@/modules/redis/services';

import { WSAuthDto, WsMessageDto } from '../dtos';
import { UserEntity } from '../entities';
import { WsJwtGuard } from '../guards';
import { UserService } from '../services';

// const permissions: PermissionChecker[] = [
//     async (ab) => ab.can(PermissionAction.CREATE, MessageEntity.name),
// ];

/**
 * 返回给客户端的用户信息
 */
type User = Pick<ClassToPlain<UserEntity>, 'id' | 'name' | 'nickname' | 'email' | 'phone'>;

/**
 * 在线的websocket用户
 */
interface Onliner {
    token: string;
    user: Partial<ClassToPlain<UserEntity>>;
    client: WebSocket;
}

@Injectable()
@WebSocketGateway(80)
@UseFilters(WsExceptionFilter)
@UsePipes(
    new WsPipe({
        transform: true,
        forbidUnknownValues: true,
        validationError: {
            target: false,
        },
    }),
)
export class WsMessageGateway {
    // redis客户端，存储在线用户
    protected redisClient: Redis;

    // 在线的用户
    protected onliners: Onliner[] = [];

    constructor(
        protected redisServer: RedisService,
        protected userService: UserService,
        // protected messageJob: MessageJob,
    ) {
        this.redisClient = this.redisServer.getClient();
    }

    /**
     * 所有在线的用户
     */
    get onLiners() {
        return this.onliners;
    }

    @WebSocketServer()
    server!: typeof Server;

    // 处理用户上线
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('online')
    async onLine(@MessageBody() data: WSAuthDto, @ConnectedSocket() client: WebSocket) {
        // 根据token，找到用户信息
        const userId = await this.getUserId(data.token);
        const user = await this.userService.findOneById(userId);

        // 创建上线者
        const onliner: Onliner = {
            token: data.token,
            user,
            client,
        };
        this.onliners.push(onliner);
        // 保存上线者的token到redis中
        await this.redisClient.sadd('online', data.token);
        // 其余的用户广播xxx已上线
        const onliners = this.onliners.filter((o) => o.user.id !== user.id);
        onliners.forEach(({ client: c }) => {
            c.send(
                JSON.stringify({
                    type: 'message',
                    message: {
                        body: `${user.nickname ?? user.name}已上线`,
                        sender: this.getUserInfo(user),
                        time: Date.now().toString(),
                    },
                }),
            );
        });
        // 给用户自己发上线消息
        client.send(
            JSON.stringify({
                type: 'message',
                message: {
                    body: `尊敬的${user.nickname ?? user.name}，您已上线`,
                    sender: this.getUserInfo(user),
                    timer: Date.now().toString(),
                },
            }),
        );

        // 监听用户下线
        // @ts-ignore
        client.on('close', async () => {
            client.terminate();
            await this.handleOnfline(onliner);
        });
    }

    /**
     * 消息异常
     * @param data
     */
    @SubscribeMessage('exception')
    sendException(
        @MessageBody()
        data: {
            status: string;
            message: any;
        },
    ): WsResponse<Record<string, any>> {
        return { event: 'exception', data };
    }

    /**
     * websocket发送消息
     * @param data
     */
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('message')
    async sendMessage(@MessageBody() data: WsMessageDto): Promise<any> {
        const { sender, receivers } = await this.getMessager(data);
        const receiversId = receivers.map((r) => r.id);
        // 找到其中的上线用户
        const onliners = this.onliners.filter((o) => receiversId.includes(o.user.id));

        // 消息内容
        const message = {
            title: data.title,
            body: data.body,
            type: data.type,
            sender: sender.id,
            receivers: data.receivers,
        };
        // await this.messageJob.saveMessage(message);
        // 在线用户发送消息
        onliners.forEach(({ client: c }) => {
            c.send(
                JSON.stringify({
                    type: 'message',
                    message: {
                        ...pick(message, ['title', 'body', 'type']),
                        sender: this.getUserInfo(sender),
                        time: Date.now().toString(),
                    },
                }),
            );
        });
        return undefined;
    }

    /**
     * websocket主动下线
     * @param data
     */
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('offline')
    async offline(@MessageBody() data: WSAuthDto) {
        const { token } = data;
        const userId = await this.getUserId(token);
        const user = await this.userService.detail(userId);
        // 从redis中删除token
        if (!isNil(token)) {
            const onliner = this.onliners.find((o) => o.user.id === userId);
            await this.handleOnfline(onliner);
        }
        return {
            event: 'offline',
            data: this.getUserInfo(user),
        };
    }

    /**
     * 从ws消息体中获得发送者与接收者
     * @param data
     */
    protected async getMessager(data: WsMessageDto) {
        // 所有的接收者
        const receivers = await this.userService.list({}, async (qb) =>
            qb.whereInIds(data.receivers),
        );
        // token
        const userId = await this.getUserId(data.token);
        // 判断当前用户是否上线
        if (isNil(this.onliners.find((o) => o.user.id === userId))) {
            throw new WsException('请登录！');
        }
        // 发送者
        const sender = await this.userService.detail(userId);
        return {
            sender,
            // 从接收者列表中滤除自己
            receivers: receivers.filter((r) => r.id !== sender.id),
        };
    }

    /**
     * 处理用户下线
     * @param param
     */
    protected async handleOnfline({ token, user }: Onliner) {
        // 删除用户的token
        await this.redisClient.srem('online', token);
        // 删除在线用户
        this.onliners = this.onLiners.filter((o) => o.user.id !== user.id);
        // 发送下线消息
        this.onliners.forEach(({ client: c }) => {
            c.send(
                JSON.stringify({
                    type: 'message',
                    message: {
                        body: `${user.nickname ?? user.name}下线啦`,
                        time: Date.now().toString(),
                        sender: this.getUserInfo(user as UserEntity),
                    },
                }),
            );
        });
    }

    /**
     * 获得部分用户信息
     * @param user
     */
    protected getUserInfo(user: UserEntity): User {
        return pick(instanceToPlain(user, { groups: ['user-detail'] }), [
            'id',
            'email',
            'phone',
            'name',
            'nickname',
        ]) as User;
    }

    protected async getUserId(accessToken: string) {
        const map = (await this.redisClient.hgetall(accessToken)) as {
            refreshToken: string;
            userId: string;
        };
        return map.userId;
    }
}
