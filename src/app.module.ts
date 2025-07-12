import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:(config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'malli',
        password: '12345',
        database: 'nest_crud',
        autoLoadEntities:true,
        synchronize:true,
      }),
      inject:[ConfigService],
    }),
    UserModule,
    AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
