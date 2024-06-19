import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Nursery } from '../entities/nursery.entity';
import { NurseryService } from '../service/nursery.service';

@Controller('nursery')
export class NurseryController extends MyNurseryBaseController<Nursery> {
    constructor(service: NurseryService){
        super(service);
    }
}
