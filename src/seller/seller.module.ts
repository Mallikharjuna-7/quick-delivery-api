import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SellerEntity } from "./seller.entity";
import { MailModule } from "src/mail/mail.module";
import { SellerController } from "./seller.controller";
import { SellerService } from "./seller.service";
import { JwtModule } from "@nestjs/jwt";
import { RolesGuard } from "src/common/guards/roles.guard";

@Module({
        imports:
        [TypeOrmModule.forFeature([SellerEntity]),MailModule,JwtModule,],
        controllers:[SellerController],
        providers:[SellerService,RolesGuard],
})
export class SellerModule{}