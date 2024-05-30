import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Parent } from '../entities/parent.entity';

@Controller('parent')
export class ParentController extends MyNurseryBaseController<Parent> {}
