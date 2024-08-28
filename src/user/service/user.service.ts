import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Query } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm';
import { createUserDto } from '../interfaces/create-user-dto.interface';
import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Role } from 'src/shared/enums/role.enum';
import { MailService } from 'src/mail/service/mail.service';
import { PaginatedItems } from 'src/shared/interfaces/paginatedItems.interface';
const argon2 = require('argon2');

@Injectable()
export class UserService extends MyNurseryBaseService<User> {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @InjectRepository(Nursery) private nurseryRepo: Repository<Nursery>,
        @Inject(forwardRef(() => MailService))
        private readonly mailService: MailService,
    ) {
        //Si ne précise pas super on accède pas à MyNurseryBaseService<User>
        super(repo);
    }

    //Méthode pour vérifier les doublons
    async eligibleCreateFormat(userDto: createUserDto): Promise<boolean> {
        this.errors = [];
        const emailRegex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');

        if (!emailRegex.test(userDto.email)) {
            this.generateError(`Veuillez vérifier le format de l'adresse email`, 'email');
        }

        const isEmailUnique = await this.verifyUnicity('email', userDto.email);

        if (!isEmailUnique) {
            this.generateError(`L'email est déjà pris`, 'email');
        }

        return this.hasErrors();
    }

    async findOne(id: string | number): Promise<User | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repo.findOne({
                where: { id: +id, isDeleted: false },
                relations: ['workplaces'],
            });
            if (foundOne) {
                // Filtrer les workplaces supprimées (isDeleted: true)
                foundOne.workplaces = foundOne.workplaces.filter((workplace) => !workplace.isDeleted);
                return foundOne;
            } else {
                this.generateError(`Il n'existe pas d'élément avec cet identifiant.`, 'id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async create(userDto: createUserDto): Promise<User | HttpException> {
        this.errors = [];
        try {
            if (await this.eligibleCreateFormat(userDto)) {
                await this.mailService.sendRegisterMail(userDto.email, userDto.name);
                const hash = await (await argon2).hash(userDto.password);
                userDto.password = hash;
                return this.repo.save(userDto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async update(id: string, dto: any): Promise<UpdateResult | HttpException> {
        this.errors = [];

        try {
            const foundOne = await this.repo.findOne({
                where: { id: id, isDeleted: false } as FindOptionsWhere<unknown>,
            });
            if (foundOne) {
                if (dto.password) {
                    const hash = await (await argon2).hash(dto.password);
                    dto.password = hash;
                }
                if (dto.workplaces) {
                    await this.setWorkplaces(+id, dto.workplaces);
                    delete dto.workplaces;
                }
                return await this.repo.update(id, dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async getNurseriesByOwner(ownerId: number): Promise<Nursery[] | HttpException> {
        this.errors = [];
        try {
            const ownerInfos = await this.repo.findOne({ where: { id: ownerId }, relations: ['nurseries'] });
            return ownerInfos.nurseries;
        } catch (err) {
            this.generateError(`Cet utilisateur n'est pas gérant`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async getPotentialOwners(): Promise<User[] | HttpException> {
        this.errors = [];
        try {
            const usersAndOwners = await this.repo.find({
                where: [{ role: Role.Owner, isDeleted: false }],
            });
            return usersAndOwners;
        } catch (err) {
            this.generateError(`Cet utilisateur n'est pas gérant`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async setWorkplaces(userId: number, workplacesIds: number[]): Promise<User | HttpException> {
        this.errors = [];

        try {
            const user = await this.repo.findOne({ where: { id: userId }, relations: ['workplaces'] });

            // Si l'utilisateur n'existe pas
            if (!user) {
                this.generateError(`L'utilisateur n'existe pas.`, 'invalid parent id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Obtention des lieux de travail par les ids
            const workplaces = await this.nurseryRepo.find({ where: { id: In(workplacesIds) } });

            // Si au moins une crèche n'existe pas
            if (!workplaces) {
                this.generateError(`Vérifiez les identifiants envoyés`, 'at least one invalid workplace id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Ajout des lieux dans l'utilisateur
            user.workplaces = workplaces;

            // Mise à jour de l'entité
            return this.repo.save(user);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'set workplaces in user');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async removeWorkplaces(userId: number, workplacesIds: number[]): Promise<User | HttpException> {
        this.errors = [];

        try {
            const user = await this.repo.findOne({ where: { id: userId }, relations: ['workplaces'] });

            // Si l'utilisateur n'existe pas
            if (!user) {
                this.generateError(`L'utilisateur n'existe pas.`, 'invalid parent id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // Obtention des lieux de travail par les ids
            const workplaces = await this.nurseryRepo.find({ where: { id: In(workplacesIds) } });

            // Si au moins une crèche n'existe pas
            if (!workplaces) {
                this.generateError(`Vérifiez les identifiants envoyés`, 'at least one invalid workplace id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            // On supprime les relations sur base du tableau d'ids
            user.workplaces = user.workplaces.filter((workplace) => !workplacesIds.includes(workplace.id));

            // Mise à jour de l'entité
            return this.repo.save(user);
        } catch (err) {
            this.generateError('Une erreur inconnue est survenue', 'delete workplaces in user');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
