import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseService } from 'src/shared/service/base.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newUserDto } from '../interfaces/new-user.interface';
import { Role } from 'src/shared/enums/role.enum';
import { Token } from 'src/shared/interfaces/token.interface';
const argon2 = require('argon2');

@Injectable()
export class UserService extends MyNurseryBaseService<User> {
    constructor(@InjectRepository(User) private repo: Repository<User>) {
        //Si ne précise pas super on accède pas à MyNurseryBaseService<User>
        super(repo);
    }

    canCreate(dto: newUserDto, user?: Token): boolean {
        return true;
    }
    //Méthode pour vérifier les doublons
    async noDupUser(userDto: newUserDto, user?: Token): Promise<boolean> {
        this.errors = [];
        const emailRegex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');

        if (!emailRegex.test(userDto.email)) {
            this.generateError(`Veuillez vérifier le format de l'adresse email`, 'email');
        }

        const isEmailUnique = await this.verifyUnicity(userDto.email, 'email');

        if (!isEmailUnique) {
            this.generateError(`L'email est déjà pris`, 'email');
        }

        return this.hasError();
    }

    async create(userDto: newUserDto, user?: Token): Promise<User | HttpException> {
        try {
            if (await this.noDupUser(userDto, user)) {
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

    hasStandardAccess(user?: Token): boolean {
        return true;
    }

    hasSpecificAccess(user?: Token): boolean {
        this.errors = [];
        if (user.role !== Role.Admin) {
            this.generateError("Vous n'avez pas les droits pour accéder à ce contenu.", 'user');
        }
        return this.hasError();
    }

    canUpdate(user?: Token): boolean {
        return true;
    }

    canDelete(user?: Token): boolean {
        return true;
    }

    async verifyUnicity(value: string, field: string): Promise<boolean> {
        const resultBasedOnField = await this.repo.findOne({ where: { [field]: value } });

        return !resultBasedOnField ? true : false;
    }
}
