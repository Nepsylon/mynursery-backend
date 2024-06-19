import { Test, TestingModule } from '@nestjs/testing';
import { NurseryService } from './nursery.service';

describe('NurseryService', () => {
  let service: NurseryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NurseryService],
    }).compile();

    service = module.get<NurseryService>(NurseryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
