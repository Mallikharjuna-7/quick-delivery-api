import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SellerEntity } from "./seller.entity";
import { MailService } from "src/mail/mail.service";
import { RegisterSellerDto } from "./register-seller.dto";
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppLogger } from "src/logger/app-logger.service";

@Injectable()
export class SellerService {
        constructor(
                @InjectRepository(SellerEntity)
                private sellerRepo: Repository<SellerEntity>,
                private mailService: MailService,
                private jwtService: JwtService,
                private readonly logger: AppLogger,
        ) {
                this.logger.setContext(SellerService.name);
        }

        async registerSeller(dto: RegisterSellerDto) {
                this.logger.log({ action: "registerSeller", email: dto.email });

                const existing = await this.sellerRepo.findOne({ where: { email: dto.email } });
                if (existing) {
                        this.logger.warn({ action: "registerSeller", message: "Email already registered", email: dto.email });
                        throw new ConflictException("Email already registered");
                }

                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const seller: SellerEntity = this.sellerRepo.create({ ...dto, otp, status: "pending" });

                await this.sellerRepo.save(seller);
                this.logger.log({ action: "registerSeller", message: "Seller saved", sellerId: seller.id });

                await this.mailService.sellerWelcomeEmail(dto.email, otp);
                this.logger.log({ action: "registerSeller", message: "OTP email sent", email: dto.email });

                return { message: "Seller registered. OTP sent to email." };
        }

        async getPendingSellers() {
                this.logger.log({ action: "getPendingSellers" });
                const seller = await this.sellerRepo.find({ where: { status: "pending" } });
                return seller;
        }

        async approveSeller(id: number) {
                this.logger.log({ action: "approveSeller", sellerId: id });

                const seller = await this.sellerRepo.findOne({ where: { id } });
                if (!seller) {
                        this.logger.error({ action: "approveSeller", message: "Seller not found", sellerId: id });
                        throw new NotFoundException("seller not found");
                }

                seller.status = "approved";
                await this.sellerRepo.save(seller);
                this.logger.log({ action: "approveSeller", message: "Seller approved", sellerId: seller.id });

                await this.mailService.sendApprovalMail(seller.email);
                this.logger.log({ action: "approveSeller", message: "Approval email sent", email: seller.email });

                return { message: "Seller approved successfully" };
        }

        async loginSeller(email: string, otp: string) {
                this.logger.log({ action: "loginSeller", email });

                const seller = await this.sellerRepo.findOneBy({ email });
                if (!seller) {
                        this.logger.error({ action: "loginSeller", message: "Seller not found", email });
                        throw new NotFoundException("seller not found");
                }

                if (seller.status !== "approved") {
                        this.logger.warn({ action: "loginSeller", message: "Seller not approved", email });
                        throw new UnauthorizedException("seller not approved yet");
                }

                if (seller.otp !== otp) {
                        this.logger.warn({ action: "loginSeller", message: "Invalid OTP", email });
                        throw new UnauthorizedException("Invalid OTP");
                }

                const payload = {
                        sub: seller.id,
                        email: seller.email,
                        role: "seller",
                };

                const access_token = await this.jwtService.signAsync(payload, {
                        secret: "access_secret",
                        expiresIn: "15m",
                });

                this.logger.log({ action: "loginSeller", message: "Login successful", sellerId: seller.id });
                return { access_token };
        }
}
