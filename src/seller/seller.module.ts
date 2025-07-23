import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SellerEntity } from "./seller.entity";
import { MailModule } from "src/mail/mail.module";
import { SellerController } from "./seller.controller";
import { SellerService } from "./seller.service";

@Module({
        imports:
        [TypeOrmModule.forFeature([SellerEntity]),MailModule],
        controllers:[SellerController],
        providers:[SellerService],
})
export class SellerModule{}