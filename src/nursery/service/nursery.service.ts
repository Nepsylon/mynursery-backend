import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { Nursery } from '../entities/nursery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createNurseryDto } from '../interface/create-nursery-dto';
import { User } from 'src/user/entities/user.entity';
import { UserNursery } from '../entities/user-nursery.entity';

@Injectable()
export class NurseryService extends MyNurseryBaseService<Nursery> {
    constructor(
        @InjectRepository(Nursery) private repo: Repository<Nursery>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(UserNursery) private userNurseryRepo: Repository<UserNursery>,
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

    async setOwnerNursery(nurseryId: number, userId: number): Promise<UserNursery | HttpException> {
        this.errors = [];

        const oldUserNursery = await this.userNurseryRepo.findOne({
            where: { nursery: { id: nurseryId } },
            relations: ['user', 'nursery'],
        });

        if (oldUserNursery != null && oldUserNursery.user.id == userId) {
            this.generateError(`L'utilisateur est déjà gérant de la crèche`, `Can't reassign same owner`);
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });

        if (!user) {
            this.generateError(`L'utilisateur n'existe pas.`, 'invalid user id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        let nursery: Nursery;
        if (oldUserNursery) {
            nursery = oldUserNursery.nursery;
        } else {
            nursery = await this.repo.findOne({ where: { id: nurseryId } });
        }

        if (!nursery) {
            this.generateError(`La crèche n'existe pas.`, 'invalid nursery id');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }

        const userNursery = new UserNursery();
        userNursery.user = user;
        userNursery.nursery = nursery;

        await this.userNurseryRepo.save(userNursery);

        user.userNursery = userNursery;
        nursery.userNursery = userNursery;

        await this.userRepo.save(user);
        await this.repo.save(nursery);

        return userNursery;
    }

    async getOwnerNursery(nurseryId: number): Promise<User> {
        const ownerNursery = await this.userNurseryRepo.findOne({ where: { nursery: { id: nurseryId } }, relations: ['user'] });
        return ownerNursery?.user;
    }
}
