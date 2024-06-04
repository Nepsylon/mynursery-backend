import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Child } from '../entities/child.entity';
import { ChildService } from '../service/child.service';

@Controller('child')
export class ChildController extends MyNurseryBaseController<Child> {
    constructor(service: ChildService) {
        super(service);
    }
}
