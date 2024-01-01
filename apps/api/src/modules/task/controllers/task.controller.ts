import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SmtpService } from '@/modules/missions/services';
import { ALLOW_GUEST } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';

import { TaskService } from '../services';
import { TaskModule } from '../task.module';

@ApiTags('任务操作')
@Depends(TaskModule)
@Controller('task')
export class TaskController {
    constructor(
        protected readonly service: TaskService,
        protected readonly mailer: SmtpService,
    ) {}

    @ALLOW_GUEST(true)
    @Post()
    start() {
        this.service.start('a03c579d-e448-41ca-a5c1-18ed4ed94192');
    }

    @ALLOW_GUEST(true)
    @Post('test')
    test() {
        try {
            this.mailer.send({
                name: 'test/welcome.html',
                from: 'azurlane16@163.com',
                to: 'azurlane202018@gmail.com',
                subject: 'welcome',
                vars: {
                    username: 'test',
                },
            });
        } catch (error) {
            console.error('err ', error);
        }
    }
}
