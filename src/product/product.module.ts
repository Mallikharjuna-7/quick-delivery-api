import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SellerEntity } from "src/seller/seller.entity";
import { LoggerModule } from "src/logger/logger.module";

@Module({
        imports:
        [TypeOrmModule.forFeature([ProductEntity,SellerEntity]),
        LoggerModule],
        controllers:[ProductController],
        providers:[ProductService],
})
export class ProductModule{}