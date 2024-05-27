import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
