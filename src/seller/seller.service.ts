import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SellerEntity } from "./seller.entity";
import { MailService } from "src/mail/mail.service";
import { RegisterSellerDto } from "./register-seller.dto";
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { console } from "inspector";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class SellerService {

        constructor(
                @InjectRepository(SellerEntity)
                private sellerRepo : Repository<SellerEntity>,
                private mailService : MailService,
                private jwtService : JwtService,
        ){}

        async registerSeller ( dto : RegisterSellerDto){

                const existing = await this.sellerRepo.findOne({where:{email:dto.email}});               
                if(existing) throw new ConflictException('Email already registered');

                const otp = Math.floor(100000 + Math.random()*900000).toString();

                const seller:SellerEntity = this.sellerRepo.create({...dto, otp, status:'pending',});

                await this.sellerRepo.save(seller);
                await this.mailService.sellerWelcomeEmail(dto.email, otp);

                return { message: 'Seller registered. OTP sent to email.'};
        }

        async getPendingSellers(){
                const seller = await this.sellerRepo.find({where:{status:'pending'}});
                return seller;
        }

        async approveSeller(id: number){
                const seller = await this.sellerRepo.findOne({where:{id}});
                if(!seller) throw new NotFoundException('seller not found');

                seller.status = 'approved';
                await this.sellerRepo.save(seller);

                await this.mailService.sendApprovalMail(seller.email);

                return {message : 'Seller approved successfully'};
        }

        async loginSeller(email:string, otp:string){
                const seller = await this.sellerRepo.findOneBy({email});
                if(!seller) {
                        throw new NotFoundException('seller not found');
                }

                if(seller.status !== 'approved'){
                        throw new UnauthorizedException('seller not approved yet');
                }

                if(seller.otp !== otp){
                        throw new UnauthorizedException('Invalid OTP');
                }

                const payload = { 
                        sub: seller.id,
                        email: seller.email,
                        role: 'seller',
                };

                const access_token = await this.jwtService.signAsync(payload,{
                        secret:'access_secret',
                        expiresIn:'15m',
                });

                return {access_token};
        }

}