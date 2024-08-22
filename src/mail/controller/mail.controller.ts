import { Controller, Get, HttpException, Query } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { MailService } from '../service/mail.service';

@Controller('email')
export class MailController {
    constructor(private mailService: MailService) {}

    @Get('confirm-register')
    async confirmRegisterMail(@Query('token') token: string): Promise<string | HttpException> {
        return this.mailService.confirmRegisterMail(token);
    }
}
