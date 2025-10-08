import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductEntity } from "./product.entity";
import { Repository } from "typeorm";
import { ProductDto } from "./product.dto";
import { SellerEntity } from "src/seller/seller.entity";
import { AppLogger } from "src/logger/app-logger.service";

@Injectable()
export class ProductService {
        constructor(
                @InjectRepository(ProductEntity)
                private readonly productRepo: Repository<ProductEntity>,

                @InjectRepository(SellerEntity)
                private readonly sellerRepo: Repository<SellerEntity>,

                private readonly logger: AppLogger,
        ) {
                this.logger.setContext(ProductService.name);
        }

        async createProduct(dto: ProductDto, sellerPayload: any) {
                this.logger.log({ action: "createProduct", sellerId: sellerPayload.userId, productName: dto.name });

                const seller = await this.sellerRepo.findOne({ where: { id: sellerPayload.userId } });
                if (!seller) {
                        this.logger.error({ action: "createProduct", message: "Seller not found", sellerId: sellerPayload.userId });
                        throw new NotFoundException("Seller not found");
                }

                const product = this.productRepo.create({
                        ...dto,
                        seller: seller,
                        isActive: true,
                } as Partial<ProductEntity>);

                const savedProduct = await this.productRepo.save(product);
                this.logger.log({ action: "createProduct", message: "Product created", productId: savedProduct.id });

                return savedProduct;
        }

        async updateImagePath(productId: number, path: string) {
                this.logger.log({ action: "updateImagePath", productId, path });
                await this.productRepo.update(productId, { imagePath: path });
        }

        async findById(id: number) {
                this.logger.log({ action: "findById", productId: id });
                const product = await this.productRepo.findOne({ where: { id } });

                if (!product) {
                        this.logger.warn({ action: "findById", message: "Product not found", productId: id });
                }

                return product;
        }
}
