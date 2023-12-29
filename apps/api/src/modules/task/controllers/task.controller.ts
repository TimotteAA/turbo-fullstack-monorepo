import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ALLOW_GUEST } from '@/modules/rbac/decorators';
import { Depends } from '@/modules/restful/decorators';

import { TaskService } from '../services';
import { TaskModule } from '../task.module';

@ApiTags('任务操作')
@Depends(TaskModule)
@Controller('task')
export class TaskController {
    constructor(protected readonly service: TaskService) {}

    @ALLOW_GUEST(true)
    @Post()
    start() {
        this.service.start('a03c579d-e448-41ca-a5c1-18ed4ed94192');
    }
}
