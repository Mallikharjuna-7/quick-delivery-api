import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}