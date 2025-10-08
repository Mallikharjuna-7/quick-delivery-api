import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface RequestWithId extends Request {
  requestId: string;
  user?: any; // keep this for JwtAuthGuard user object
}

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('register/customer')
    @HttpCode(200)
    registerCustomer(@Body() dto: RegisterDto, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Register customer request received', { email: dto.email, requestId: req.requestId });
        return this.authService.register(dto, 'customer', req.requestId);
    }

    @Post('register/delivery_patner')
    @HttpCode(200)
    registerDeliveryAgent(@Body() dto: RegisterDto, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Register delivery agent request received', { email: dto.email, requestId: req.requestId });
        return this.authService.register(dto, 'delivery_patner', req.requestId);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Login request received', { email: dto.email, requestId: req.requestId });
        return this.authService.login(dto, req.requestId);
    }

    @Post('refresh')
    refresh(@Body('refresh_token') token: string, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Refresh token request received', { requestId: req.requestId });
        return this.authService.refreshToken(token, req.requestId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(200)
    getMe(@Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Get current user request', { userId: req.user.userId, requestId: req.requestId });
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('update_password')
    async updatePassword(@Request() req: RequestWithId, @Body() body: UpdatePasswordDto) {
        const userId = req.user.userId;
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Update password request received', { userId, requestId: req.requestId });
        return this.authService.updatePassword(userId, body, req.requestId);
    }

    @HttpCode(200)
    @Post('forget_password')
    async forgetPassword(@Body() body: ForgetPasswordDto, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Forget password request received', { email: body.email, requestId: req.requestId });
        return this.authService.sendResetLink(body.email, req.requestId);
    }

    @Post('reset_password')
    async resetPassword(@Body() body: ResetPasswordDto, @Request() req: RequestWithId) {
        this.authService.logger.setContext('AuthController');
        this.authService.logger.log('Reset password request received', { token: body.token, requestId: req.requestId });
        return this.authService.resetPassword(body.token, body.newPassword, req.requestId);
    }
}
