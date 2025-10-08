import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]),
            LoggerModule],
  providers: [UserService],
  controllers: [UserController],
  exports:[UserService],
})
export class UserModule {}
