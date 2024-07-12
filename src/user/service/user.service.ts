import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createUserDto } from '../interfaces/create-user-dto.interface';
import { Nursery } from 'src/nursery/entities/nursery.entity';
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

    async getNurseriesByOwner(ownerId: number): Promise<Nursery[]> {
        const ownerInfos = await this.repo.findOne({ where: { id: ownerId }, relations: ['nurseries'] });
        return ownerInfos.nurseries;
    }
}
