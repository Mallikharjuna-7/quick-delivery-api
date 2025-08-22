import { SellerEntity } from "src/seller/seller.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ProductEntity{

        @PrimaryGeneratedColumn()
        id : number;

        @Column()
        name : string;

        @Column()
        description : string;

        @Column()
        price : string;

        @Column()
        category : string;

        @Column({ nullable: true })
        imagePath : string;

        @ManyToOne(()=> SellerEntity, seller => seller.products)
        seller : SellerEntity;

        @CreateDateColumn()
        createdAt : Date;

        @UpdateDateColumn()
        updatedAt : Date;

        @Column({default : true})
        isActive : boolean;
}