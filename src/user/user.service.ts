import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepo:Repository<UserEntity>,
    ){}

    async findById(id:number){
        return this.userRepo.findOne({where:{id}});
    }

    async updatePassword(id:number, newHashedPassword:string){
        console.log('Updating user:', id);
        await this.userRepo.update(id,{password:newHashedPassword});
    }

}
