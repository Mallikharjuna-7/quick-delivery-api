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
        host: 'my_postgres',
        port: 5432,
        username: 'postgres',
        password: 'admin',
        database: 'mydb',
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
