import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SellerService } from "./seller.service";
import { RegisterSellerDto } from "./register-seller.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorators";
import { AppLogger } from "src/logger/app-logger.service";

@Controller("seller")
export class SellerController {
        constructor(
                private readonly sellerService: SellerService,
                private readonly logger: AppLogger,
        ) {
                this.logger.setContext(SellerController.name);
        }

        @Post("register")
        register(@Body() dto: RegisterSellerDto) {
                this.logger.log({ action: "register", email: dto.email });
                return this.sellerService.registerSeller(dto);
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles("admin")
        @Get("pending")
        getPendingSellers() {
                this.logger.log({ action: "getPendingSellers", message: "Admin fetching pending sellers" });
                return this.sellerService.getPendingSellers();
        }

        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles("admin")
        @Patch("approve/:id")
        approveSeller(@Param("id") id: number) {
                this.logger.log({ action: "approveSeller", sellerId: id, message: "Admin approving seller" });
                return this.sellerService.approveSeller(id);
        }

        @Post("login")
        loginSeller(@Body() body: { email: string; otp: string }) {
                this.logger.log({ action: "loginSeller", email: body.email });
                return this.sellerService.loginSeller(body.email, body.otp);
        }
}
