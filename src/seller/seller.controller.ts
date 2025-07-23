import { Body, Controller, Post } from "@nestjs/common";
import { SellerService } from "./seller.service";
import { RegisterSellerDto } from "./register-seller.dto";

@Controller('seller')
export class SellerController {

        constructor(private readonly sellerService:SellerService){}

        @Post('register')
        register(@Body() dto:RegisterSellerDto){
                return this.sellerService.registerSeller(dto);
        }
}