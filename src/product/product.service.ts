import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { ProductDto } from "./product.dto";
import { SellerEntity } from "src/seller/seller.entity";

@Injectable()
export class ProductService {
        constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepo : Repository<ProductEntity>,
   
        @InjectRepository(SellerEntity)
        private readonly sellerRepo : Repository<SellerEntity>,     
        ){}

        async createProduct (dto : ProductDto, sellerPayload: any){

                const seller = await this.sellerRepo.findOne({where: { id: sellerPayload.userId },});
                
                const product = this.productRepo.create({...dto,seller:seller,isActive:true,}as Partial<ProductEntity>);
                
                return this.productRepo.save(product);
        }

        async updateImagePath(productId:number, path:string){
                await this.productRepo.update(productId,{imagePath: path});
        }

        async findById(id:number){
                return this.productRepo.findOne({where:{id}});
        }
}