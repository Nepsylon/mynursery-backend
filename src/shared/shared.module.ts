import { Module } from '@nestjs/common';
import { MyNurseryBaseController } from './controller/base.controller';

@Module({
    imports: [],
    controllers: [MyNurseryBaseController],
    providers: [],
    exports: [],
})
export class SharedModule {}
