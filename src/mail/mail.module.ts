import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
    providers: [MailService],
    imports: [
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    host: 'smtp.example.com',
                    port: 587,
                    secure: false, // upgrade later with STARTTLS
                    auth: {
                        user: 'username',
                        pass: 'password',
                    },
                },
                defaults: {
                    from: '"nest-modules" <modules@nestjs.com>',
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
})
export class MailModule {}
