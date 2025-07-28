import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SellerService } from "./seller.service";
import { RegisterSellerDto } from "./register-seller.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorators";

@Controller('seller')
export class SellerController {

        constructor(private readonly sellerService:SellerService){}

        @Post('register')
        register(@Body() dto:RegisterSellerDto){
                return this.sellerService.registerSeller(dto);
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('admin')
        @Get('pending')
        getPendingSellers(){
               return this.sellerService.getPendingSellers();
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('admin')
        @Patch('approve/:id')
        approveSeller(@Param('id') id:number){
                return this.sellerService.approveSeller(id);
        }

        @Post('login')
        loginSeller(@Body() body:{email:string, otp:string}){
                return this.sellerService.loginSeller(body.email,body.otp);
        }
}