import { Test, TestingModule } from '@nestjs/testing';
import { NurseryController } from './nursery.controller';

describe('NurseryController', () => {
    let controller: NurseryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NurseryController],
        }).compile();

        controller = module.get<NurseryController>(NurseryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
