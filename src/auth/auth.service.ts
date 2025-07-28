import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {

    constructor(@InjectRepository(UserEntity)
                private userRepo : Repository<UserEntity>,
                private userService : UserService,
                private jwtService : JwtService,
                private mailService : MailService){    
    }

    async register(dto:RegisterDto, role:string):Promise<any>{
        console.log("dto: ", dto)
        const exists = await this.userRepo.findOne({where:{email:dto.email}});
        console.log("Exists: ", exists);
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

        const payload = {sub:user.id, email:user.email, role:user.role};
        
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
                {sub:payload.sub, email:payload.email},{secret:'access-secret',expiresIn:'15m'},
            );

            const newRefreshToken = await this.jwtService.signAsync(
                {sub:payload.sub, email:payload.email},{secret:'refresh-secret',expiresIn:'30m'},
            );

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };

        }catch(err){
            throw new UnauthorizedException('invalid refresh token');
        }
    }

    async updatePassword(userId: number, dto:UpdatePasswordDto){
        const user = await this.userService.findById(userId);

        const isMatch = await bcrypt.compare(dto.oldPassword, user?.password);
        if(!isMatch) {
            throw new UnauthorizedException('Old password is incorrect');
        }

        const newHashed = await bcrypt.hash(dto.newPassword,10);
        await this.userService.updatePassword(userId,newHashed);

        return { message : 'Password updated successfully'};
    }

    async sendResetLink(email:string){

        if (!email || email.trim() === '') {
            throw new BadRequestException('Email is required');
        }

        const user = await this.userRepo.findOne({where:{email}});

        if(!user){
            throw new UnauthorizedException('Email not registered');
        }

        const token = this.jwtService.sign(
            {sub:user.id},
            {secret:'reset_secret',expiresIn:'15m'},
        );

        const resetLink = `http://172.18.0.2:3000/reset_password?token=${token}`;
        await this.mailService.sendResetPasswordEmail(user.email,resetLink);

        console.log('ResetLink :',resetLink);

        return { message : 'Reset link sent to your mail'};
    }

    async resetPassword(token:string, newPassword:string){
        try{
            const payload = this.jwtService.verify(token,{secret:'reset_secret'});
            const user = await this.userRepo.findOne({where:{id:payload.sub}});

            if(!user){
                throw new UnauthorizedException('User not found');
            }

            const hashed = await bcrypt.hash(newPassword,10);
            user.password = hashed;
            await this.userRepo.save(user);

            return { message : 'Password has been reset successfully.'};
            
        }catch(err){
            throw new UnauthorizedException('Invalid or expired reset token');
        }
    }


}
