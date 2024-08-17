import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailController } from './controller/mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UserModule),
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    host: process.env.HOST_SMTP,
                    port: 587,
                    secure: false, // upgrade later with STARTTLS
                    auth: {
                        user: process.env.USER_MAIL,
                        pass: process.env.PASSWORD_MAIL,
                    },
                },
                defaults: {
                    from: process.env.SENDER_MAIL,
                },
                template: {
                    dir: process.cwd() + '/templates/',
                    adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
    ],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
