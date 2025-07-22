import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService:AuthService){}

    @Post('register/customer')
    @HttpCode(200)
    registerCustomer(@Body() dto:RegisterDto){
        return this.authService.register(dto,'customer');
    }

    @Post('register/delivery_patner')
    @HttpCode(200)
    registerDeliveryAgent(@Body() dto:RegisterDto){
        console.log("xyz -- dto:", dto)
        return this.authService.register(dto,'delivery_patner');
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto:LoginDto){
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body('refresh_token') token:string){
        return this.authService.refreshToken(token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(200)
    getMe(@Request() req){
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('update_password')
    async updatePassword(
        @Request() req,
        @Body() body: UpdatePasswordDto,
    ){
        const userId = req.user.userId;

        console.log('User ID:', userId);
        return this.authService.updatePassword(userId,body);
    }

    @HttpCode(200)
    @Post('forget_password')
    async forgetPassword(@Body() body:ForgetPasswordDto){
        return this.authService.sendResetLink(body.email);
    }

    @Post('reset_password')
    async resetPassword(@Body() body:ResetPasswordDto){
        return this.authService.resetPassword(body.token,body.newPassword);
    }
}
