import { ProductEntity } from "src/product/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SellerEntity {

        @PrimaryGeneratedColumn()
        id : number;

        @Column()
        name : string;

        @Column()
        email : string;

        @Column()
        businessName : string;

        @Column()
        gstNumber : string;

        @Column()
        status : string;

        @Column()
        otp : string;

        @OneToMany(() => ProductEntity, (product) => product.seller)
        products: ProductEntity[];

}