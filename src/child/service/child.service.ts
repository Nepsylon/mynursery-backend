import { Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Child } from '../entities/child.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createChildDto } from '../interfaces/create-child-dto';

@Injectable()
export class ChildService extends MyNurseryBaseService<Child> {
    constructor(@InjectRepository(Child) private repo: Repository<Child>) {
        super(repo);
    }

    eligibleCreateFormat(dto: createChildDto): boolean {
        this.errors = [];
        return this.hasErrors();
    }
}
