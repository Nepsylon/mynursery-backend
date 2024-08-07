import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { createUserDto } from '../interfaces/create-user-dto.interface';
import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Role } from 'src/shared/enums/role.enum';
const argon2 = require('argon2');

@Injectable()
export class UserService extends MyNurseryBaseService<User> {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        //@InjectRepository(Nursery) private nurseryRepository: Repository<Nursery>,
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

    async create(userDto: createUserDto): Promise<User | HttpException> {
        try {
            if (await this.eligibleCreateFormat(userDto)) {
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
                return await this.repo.update(id, dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async getNurseriesByOwner(ownerId: number): Promise<Nursery[] | HttpException> {
        try {
            const ownerInfos = await this.repo.findOne({ where: { id: ownerId }, relations: ['nurseries'] });
            return ownerInfos.nurseries;
        } catch (err) {
            this.generateError(`Cet utilisateur n'est pas gérant`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    async getPotentialOwners(): Promise<User[] | HttpException> {
        try {
            const usersAndOwners = await this.repo.find({ where: [{ role: Role.Owner }, { role: Role.User }] });
            return usersAndOwners;
        } catch (err) {
            this.generateError(`Cet utilisateur n'est pas gérant`, 'not an owner');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }
}
