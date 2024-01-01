import path from 'path';

import { Injectable } from '@nestjs/common';
import Email from 'email-templates';
import handlebars from 'handlebars';
import mailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import { deepMerge } from '@/modules/config/utils';
import { MISSION } from '@/modules/task/decorator';

import type { SmtpClientConfig, SmtpSendParams } from '../types';

/**
 * SMTP邮件发送驱动
 */
@MISSION()
@Injectable()
export class SmtpService {
    /**
     * 初始化smtp服务
     * @param options
     */
    constructor(protected readonly options: SmtpClientConfig) {}

    /**
     * 合并配置并发送邮件
     * @param params
     * @param options
     */
    async send<T>(params: SmtpSendParams & T, options?: SmtpClientConfig) {
        const newOptions = deepMerge(this.options, options ?? {}) as SmtpClientConfig;
        const client = this.makeClient(newOptions);
        return this.makeSend(client, params, newOptions);
    }

    /**
     * 创建NodeMailer客户端
     * @param options
     */
    protected makeClient(options: SmtpClientConfig) {
        const { host, secure, user, password, port } = options;
        const clientOptions: SMTPConnection.Options = {
            host,
            secure: secure ?? false,
            auth: {
                user,
                pass: password,
            },
        };
        if (!clientOptions.secure) clientOptions.port = port ?? 25;
        return mailer.createTransport(clientOptions);
    }

    /**
     * 转义通用发送参数为NodeMailer发送参数
     * @param client
     * @param params
     * @param options
     */
    protected async makeSend(client: Mail, params: SmtpSendParams, options: SmtpClientConfig) {
        // 模板路径
        const tplPath = path.resolve(options.resource, params.name ?? 'custom');
        console.log('tplPath ', tplPath, options.resource);

        // const source = readFileSync(tplPath, 'utf-8');
        const source = `
        
        <!doctype html>
<html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
            }

            .header h1 {
                color: #333;
                font-size: 24px;
                margin: 0;
            }

            .content {
                margin-bottom: 30px;
            }

            .content p {
                margin: 0 0 10px;
                line-height: 1.5;
            }

            .footer {
                text-align: center;
            }

            .footer p {
                color: #999;
                font-size: 14px;
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Greetings, {{username}}!</h1>
            </div>
            <div class="content">
                <p>Thank you for being a valued member of our community.</p>
                <p>
                    We appreciate your continued support and would like to offer you a special
                    discount on your next purchase.
                </p>
                <p>
                    Simply use the code <strong>WELCOME10</strong> at checkout to enjoy a 10%
                    discount.
                </p>
                <p>We hope you enjoy your shopping experience with us.</p>
            </div>
            <div class="footer">
                <p>Best regards,</p>
                <p>The Team</p>
            </div>
        </div>
    </body>
</html>
`;
        const { vars } = params;
        const template = handlebars.compile(source);
        const htmlToSend = template(vars);
        console.log('options.resource ', options.resource);
        const email = new Email({
            message: {
                subject: '你好啊',
                from: params.from ?? options.from ?? options.user,
            },
            // Send the actual email
            send: true,
            transport: client,
            views: {
                options: {
                    extension: 'html', // <--- use .html file extension
                },
                root: options.resource,
            },
        });

        email
            .send({
                template: '/test/welcome', // no need for file extension
                message: {
                    to: 'azurlane202018@gmail.com',
                },
                locals: {
                    username: 'John',
                },
            })
            .then(console.log)
            .catch(console.error);

        // return client.sendMail({
        //     ...pick(params, ['from', 'to', 'reply', 'attachments', 'subject', 'attachments']),
        //     html: htmlToSend,
        // });
    }
}
