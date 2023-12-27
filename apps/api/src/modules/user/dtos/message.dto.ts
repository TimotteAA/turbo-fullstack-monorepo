import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

/** ***************************************** ws消息体dto */
@Injectable()
export class WSAuthDto {
    @IsNotEmpty({
        message: 'token不能为空',
    })
    token!: string;
}

/**
 * 发送消息dto
 */
@Injectable()
export class WsMessageDto extends WSAuthDto {
    @IsOptional()
    title?: string;

    @IsNotEmpty({
        message: '消息内容不能为空',
    })
    body!: string;

    // 发送者可以从token中获得
    // @IsNotEmpty({message: "FASHON"})
    // sender!: string;

    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsNotEmpty({ message: '接收者不能为空', each: true })
    receivers: string[];

    @IsOptional()
    type?: string;
}
