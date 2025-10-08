import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { AppLogger } from 'src/logger/app-logger.service';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        public logger: AppLogger
    ) {}

    async register(dto: RegisterDto, role: string, requestId?: string): Promise<any> {
        this.logger.setContext("AuthService");

        this.logger.log("Registration attempt", { email: dto.email, role, requestId });

        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) {
            this.logger.warn("Email already registered", { email: dto.email, requestId });
            throw new ConflictException("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({ ...dto, password: hashedPassword, role });
        await this.userRepo.save(user);

        this.logger.log("User registered successfully", { userId: user.id, email: user.email, role, requestId });

        await this.mailService.sendWelcomeEmail(user.email, role);
        this.logger.debug("Welcome email sent", { email: user.email, requestId });

        return { statusCode: 200, message: "Registration successful", error: "" };
    }

    async login(dto: LoginDto, requestId?: string) {
        this.logger.setContext("AuthService");

        this.logger.log("Login attempt", { email: dto.email, requestId });

        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            this.logger.warn("Invalid email login attempt", { email: dto.email, requestId });
            throw new UnauthorizedException('Invalid email');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            this.logger.warn("Invalid password login attempt", { email: dto.email, requestId });
            throw new UnauthorizedException('Invalid password');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload, { secret: 'access_secret', expiresIn: '15m' });
        const refreshToken = await this.jwtService.signAsync(payload, { secret: 'refresh_secret', expiresIn: '30m' });

        this.logger.log("User logged in successfully", { userId: user.id, email: user.email, role: user.role, requestId });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, age: user.age, role: user.role },
        };
    }

    async refreshToken(refresh_token: string, requestId?: string) {
        this.logger.setContext("AuthService");

        this.logger.log("Refresh token attempt", { refreshToken: refresh_token, requestId });

        try {
            const payload = await this.jwtService.verifyAsync(refresh_token, { secret: 'refresh_secret' });
            this.logger.log("Refresh token verified", { userId: payload.sub, email: payload.email, requestId });

            const newAccessToken = await this.jwtService.signAsync({ sub: payload.sub, email: payload.email }, { secret: 'access_secret', expiresIn: '15m' });
            const newRefreshToken = await this.jwtService.signAsync({ sub: payload.sub, email: payload.email }, { secret: 'refresh_secret', expiresIn: '30m' });

            this.logger.log("New tokens generated successfully", { userId: payload.sub, email: payload.email, requestId });

            return { access_token: newAccessToken, refresh_token: newRefreshToken };
        } catch (err) {
            this.logger.warn("Invalid refresh token attempt", { refreshToken: refresh_token, error: err.message, requestId });
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async updatePassword(userId: number, dto: UpdatePasswordDto, requestId?: string) {
        this.logger.setContext("AuthService");

        this.logger.log("Password update attempt", { userId, requestId });

        const user = await this.userService.findById(userId);
        if (!user) {
            this.logger.warn("User not found for password update", { userId, requestId });
            throw new NotFoundException('User not found');
        }

        const isMatch = await bcrypt.compare(dto.oldPassword, user?.password);
        if (!isMatch) {
            this.logger.warn("Incorrect old password attempt", { userId, requestId });
            throw new UnauthorizedException('Old password is incorrect');
        }

        const newHashed = await bcrypt.hash(dto.newPassword, 10);
        await this.userService.updatePassword(userId, newHashed);

        this.logger.log("Password updated successfully", { userId, requestId });
        return { message: 'Password updated successfully' };
    }

    async sendResetLink(email: string, requestId?: string) {
        this.logger.setContext("AuthService");

        this.logger.log("Send reset link attempt", { email, requestId });

        if (!email || email.trim() === '') {
            this.logger.warn("Send reset link failed: email missing", { requestId });
            throw new BadRequestException('Email is required');
        }

        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            this.logger.warn("Send reset link failed: email not registered", { email, requestId });
            throw new UnauthorizedException('Email not registered');
        }

        const token = this.jwtService.sign({ sub: user.id }, { secret: 'reset_secret', expiresIn: '15m' });
        const resetLink = `http://172.18.0.2:3000/reset_password?token=${token}`;

        await this.mailService.sendResetPasswordEmail(user.email, resetLink);

        this.logger.log("Reset link sent successfully", { userId: user.id, email: user.email, resetLink, requestId });

        return { message: 'Reset link sent to your mail' };
    }

    async resetPassword(token: string, newPassword: string, requestId?: string) {
        this.logger.setContext("AuthService");

        this.logger.log("Reset password attempt", { token, requestId });

        try {
            const payload = this.jwtService.verify(token, { secret: 'reset_secret' });
            this.logger.log("Reset token verified", { userId: payload.sub, requestId });

            const user = await this.userRepo.findOne({ where: { id: payload.sub } });
            if (!user) {
                this.logger.warn("Reset password failed: user not found", { userId: payload.sub, requestId });
                throw new UnauthorizedException('User not found');
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            user.password = hashed;
            await this.userRepo.save(user);

            this.logger.log("Password reset successfully", { userId: user.id, email: user.email, requestId });

            return { message: 'Password has been reset successfully.' };
        } catch (err) {
            this.logger.warn("Reset password failed: invalid or expired token", { token, error: err.message, requestId });
            throw new UnauthorizedException('Invalid or expired reset token');
        }
    }

}
