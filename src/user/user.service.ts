import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { AppLogger } from 'src/logger/app-logger.service';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
        public logger: AppLogger
    ) {}

    async findById(id: number, requestId?: string) {
        this.logger.setContext('UserService');
        this.logger.log('Find user by ID attempt', { userId: id, requestId });

        const user = await this.userRepo.findOne({ where: { id } });

        if (!user) {
            this.logger.warn('User not found', { userId: id, requestId });
        } else {
            this.logger.log('User found', { userId: id, requestId });
        }

        return user;
    }

    async updatePassword(id: number, newHashedPassword: string, requestId?: string) {
        this.logger.setContext('UserService');
        this.logger.log('Updating user password', { userId: id, requestId });

        await this.userRepo.update(id, { password: newHashedPassword });

        this.logger.log('User password updated successfully', { userId: id, requestId });
    }

}
