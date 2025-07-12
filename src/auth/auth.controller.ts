import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
}
