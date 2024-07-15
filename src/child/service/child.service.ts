import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Child } from '../entities/child.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createChildDto } from '../interfaces/create-child-dto';
import { Nursery } from 'src/nursery/entities/nursery.entity';

@Injectable()
export class ChildService extends MyNurseryBaseService<Child> {
    constructor(
        @InjectRepository(Child) private repo: Repository<Child>,
        @InjectRepository(Nursery) private nurseryRepository: Repository<Nursery>,
    ) {
        super(repo);
    }

    async eligibleCreateFormat(dto: createChildDto): Promise<boolean> {
        this.errors = [];
        return this.hasErrors();
    }

    async setNurseryToChild(ChildId: number, nurseryId: number): Promise<Child | HttpException> {
        this.errors = [];

        const nursery = await this.nurseryRepository.findOneBy({ id: nurseryId });

        const child = await this.repo.findOneBy({ id: ChildId });

        // Si la crèche n'existe pas
        if (!child) {
            this.generateError(`L'enfant n'existe pas.`, 'invalid child id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si même crèche erreur
        if (child.nursery != null && child.nursery.id == nurseryId) {
            this.generateError(`La crèche est déjà attribuée`, `Can't reassign same nursery`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si la crèche n'existe pas
        if (!nursery) {
            this.generateError(`La crèche n'existe pas.`, 'invalid nursery id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        child.nursery = nursery;
        return await this.repo.save(child);
    }
}
