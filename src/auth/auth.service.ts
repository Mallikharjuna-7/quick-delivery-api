import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {

    constructor(@InjectRepository(UserEntity)
                private userRepo : Repository<UserEntity>,
                private jwtService : JwtService,
                private mailService : MailService){    
    }

    async register(dto:RegisterDto, role:string):Promise<any>{

        const exists = await this.userRepo.findOne({where:{email:dto.email}});
        if(exists) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password,10);
        const user = this.userRepo.create({...dto,password:hashedPassword,role});
        await this.userRepo.save(user);

        await this.mailService.sendWelcomeEmail(user.email,role);

        return {statusCode : 200,
                message : 'Registration successfull',  
                error:''
        };
    }

    async login(dto : LoginDto){

        const user = await this.userRepo.findOne({where:{email:dto.email}});
        if(!user) throw new UnauthorizedException('Invalid email');

        const isMatch = await bcrypt.compare(dto.password,user.password);
        if(!isMatch) throw new UnauthorizedException('Invalid password');

        const payload = {id:user.id, email:user.email};
        
        const accessToken = await this.jwtService.signAsync(payload,{
            secret:'access_secret',
            expiresIn:'15m',
        });

        const refreshToken = await this.jwtService.signAsync(payload,{
            secret:'refresh_secret',
            expiresIn:'30m',
        })

        return  {
            access_token: accessToken,
            refresh_token: refreshToken,
            user:{
                id:user.id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                age:user.age,
                role:user.role,
            },
        };
    }

    async refreshToken(refresh_token: string){
        try{
            const payload = await this.jwtService.verifyAsync(refresh_token,{ secret:'refresh_secret',});
            
            const newAccessToken = await this.jwtService.signAsync(
                {id:payload.sub, email:payload.email},{secret:'access-secret',expiresIn:'15m'},
            );

            const newRefreshToken = await this.jwtService.signAsync(
                {id:payload.sub, email:payload.email},{secret:'refresh-secret',expiresIn:'30m'},
            );

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };

        }catch(err){
            throw new UnauthorizedException('invalid refresh token');
        }
    }
}
