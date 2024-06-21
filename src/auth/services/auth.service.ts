import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/shared/interfaces/token.interface';
import { ErrorMessage } from 'src/shared/models/error-message';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
const argon2 = require('argon2');

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async signIn(email: string, pass: string): Promise<{ access_token: string } | ErrorMessage> {
        try {
            const user = await this.userRepo.findOne({ where: { email: email } });

            if (!user || !(await argon2.verify(user.password, pass))) {
                //throw new UnauthorizedException();
                return new ErrorMessage("Veuillez vérifier l'email ou le mot de passe utilisateur.");
            }

            const payload: Token = { id: user.id.toString(), role: user.role };

            return {
                access_token: await this.jwtService.signAsync(payload),
            };
        } catch (err) {
            throw err;
        }
    }
}
