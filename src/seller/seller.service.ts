import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SellerEntity } from "./seller.entity";
import { MailService } from "src/mail/mail.service";
import { RegisterSellerDto } from "./register-seller.dto";
import { ConflictException } from "@nestjs/common";

export class SellerService {

        constructor(
                @InjectRepository(SellerEntity)
                private sellerRepo : Repository<SellerEntity>,
                private mailService : MailService,
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
}