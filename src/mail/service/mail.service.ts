import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from 'src/auth/jwtConstants';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {}

    async sendRegisterMail(email: string, name: string) {
        const token = jwt.sign({ email }, jwtConstants.secret, { expiresIn: '1d' });

        const confirmationLink = `${process.env.LOCAL_API}/email/confirm-register?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: "Validation d'inscription",
            template: 'register',
            context: {
                firstName: name,
                verificationLink: confirmationLink,
            },
        });
    }

    async confirmRegisterMail(token: string): Promise<User | HttpException> {
        try {
            const decodedToken = jwt.verify(token, jwtConstants.secret) as { email: string };
            // La méthode renvoie une liste mais comme un mail est unique (= une seule réponse), il faudra récupérer l'index 0
            const userList = await this.userService.searchElements('email', decodedToken.email);
            const user = userList[0];

            user.isVerified = true;
            return user.save();
        } catch (error) {
            throw new HttpException('Lien invalide ou adresse mail inexistante', HttpStatus.BAD_REQUEST);
        }
    }
}
