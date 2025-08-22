import { Body, Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductDto } from "./product.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorators";
import { extname } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';

@Controller('product')
export class ProductController {

        constructor(private readonly productService : ProductService){}

        @Post()
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('seller')
        async createProduct(@Body() dto:ProductDto, @Req() req){
                const sellerPayload = req.user;
                return this.productService.createProduct(dto,sellerPayload);
        }

        @Post(':id/image')
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles('seller')
        @UseInterceptors(
                FileInterceptor('image',{storage:diskStorage({
                        destination:(req, file,cb) => {
                                const id = req.params.id;
                                const uploadPath = `./uploads/products/${id}`;

                                require('fs').mkdirSync(uploadPath,{recursive:true});
                                cb(null,uploadPath);
                        },
                        filename:(req,file,cb) => {
                                const uniqueName = `product-${Date.now()}${extname(file.originalname)}`;

                                cb(null,uniqueName);
                        },
                }),
                }),
        )
        async uploadImage(@Param ('id') id:number, @UploadedFile() file:any,){
                const path = `${file.destination}/${file.filename}`;
                await this.productService.updateImagePath(Number(id),path);
                return { message : 'Image uploaded', path};
        }

}