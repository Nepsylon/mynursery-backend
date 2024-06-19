import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChildModule } from './child/child.module';
import { ParentModule } from './parent/parent.module';
import { NurseryModule } from './nursery/nursery.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.HOST,
            port: +process.env.POSTGRES_PORT,
            username: process.env.USERNAME_POSTGRESQL,
            password: process.env.PASSWORD_POSTGRESQL,
            database: process.env.DATABASE,
            synchronize: true,
            //Number of attempts to connect to the database (default: 10)
            retryAttempts: 10,
            //if true, entities will be loaded automatically (default: false)
            autoLoadEntities: true,
        }),
        AuthModule,
        UserModule,
        ChildModule,
        ParentModule,
        NurseryModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private dataSource: DataSource) {}
}
