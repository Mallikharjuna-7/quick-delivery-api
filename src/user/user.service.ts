import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepo:Repository<UserEntity>,
    ){}

    async create(userDto:UserDto, role:string):Promise<UserEntity>{
        const user = this.userRepo.create({...userDto,role,});
        const savedUser = await this.userRepo.save(user);
        console.log('databse :',savedUser);
        return savedUser;
    }

    
}
