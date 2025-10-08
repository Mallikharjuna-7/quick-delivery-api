import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { LoggerModule } from 'src/logger/logger.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),PassportModule,JwtModule.register({}),MailModule,UserModule,LoggerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy]
})
export class AuthModule {}
