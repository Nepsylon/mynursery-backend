import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Parent } from '../entities/parent.entity';
import { ParentService } from '../service/parent.service';

@Controller('parents')
export class ParentController extends MyNurseryBaseController<Parent> {
    constructor(service: ParentService) {
        super(service);
    }
}
