import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { SellerEntity } from "src/seller/seller.entity";

@Module({
        imports:
        [TypeOrmModule.forFeature([ProductEntity,SellerEntity])],
        controllers:[ProductController],
        providers:[ProductService],
})
export class ProductModule{}