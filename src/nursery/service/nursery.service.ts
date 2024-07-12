import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Nursery } from '../entities/nursery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createNurseryDto } from '../interface/create-nursery-dto';
import { User } from 'src/user/entities/user.entity';
import { stringify } from 'querystring';

@Injectable()
export class NurseryService extends MyNurseryBaseService<Nursery> {
    constructor(
        @InjectRepository(Nursery) private repo: Repository<Nursery>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) {
        super(repo);
    }

    /**
     * Méthode qui vérifie les champs obligatoires (facultative)
     * @param dto Interface attendu pour créer une entité Nursery
     * @returns Une valeur booléenne selon la validité des champs
     */
    async eligibleCreateFormat(dto: createNurseryDto): Promise<boolean> {
        this.errors = [];

        const isNameUnique = await this.verifyUnicity('name', dto.name);
        if (!isNameUnique) {
            this.generateError(`Le nom de la crèche est déjà pris`, 'nursery name');
        }
        return this.hasErrors();
    }

    async setOwnerNursery(nurseryId: number, newOwnerId: number): Promise<Nursery | HttpException> {
        this.errors = [];

        const nursery = await this.repo.findOneBy({ id: nurseryId });

        // Si la crèche n'existe pas
        if (!nursery) {
            this.generateError(`La crèche n'existe pas.`, 'invalid nursery id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        // Si même gérant alors erreur
        if (nursery.owner != null && nursery.owner.id == newOwnerId) {
            this.generateError(`L'utilisateur est déjà gérant de la crèche`, `Can't reassign same owner`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
        console.log(nurseryId, newOwnerId);

        const user = await this.userRepo.findOne({ where: { id: newOwnerId }, relations: ['nurseries'] });

        // Si le nouveau gérant n'existe pas => erreur
        if (!user) {
            this.generateError(`L'utilisateur n'existe pas.`, 'invalid user id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        user.nurseries.push(nursery);
        await this.userRepo.save(user);

        return await this.repo.save(nursery);
    }

    async getOwnerNursery(nurseryId: number): Promise<User> {
        try {
            const ownerNursery = await this.repo.findOne({ where: { id: nurseryId }, relations: ['owner'] });
            if (ownerNursery) {
                return ownerNursery.owner;
            } else {
                this.generateError(`La crèche spécifiée n'a pas de propriétaire ou n'existe pas.`, 'no owner');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }
}
