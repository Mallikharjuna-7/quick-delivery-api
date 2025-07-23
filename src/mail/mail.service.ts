import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    private transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'malli.test6162@gmail.com',
                pass: 'rpso pmgq whlg wiys',
            },
        });
    }

    async sendWelcomeEmail(to:String, role:string){
        const subject = `Welcome ${role === 'customer'?'Customer':'Delivery Patner'}`;

        const message = role === 'customer'?`Hi! Thankyou you for registering as a valued customer.`
        :`Hi! Thankyou you for registering as a valued Delivery Patner.`;

        const mailOptions = {
            from: 'malli.test6162@gmail.com',
            to,
            subject,
            html: `<h2>${subject}</h2> <p>${message}</p>`,
        };

        return this.transporter.sendMail(mailOptions);

    }

    async sendResetPasswordEmail(to:string, resetLink:string){
        await this.transporter.sendMail({
            to,
            subject:'Reset Your Password',
            html:`
            <p>You requested to reset your password.</p>
            <p>Click <a href="${resetLink}">here</a> to reset. This link is valid for 15minutes only.</p>
            `,
        });
    }

    async sellerWelcomeEmail (to:string, otp:string){
        await this.transporter.sendMail({
            to,
            subject:'Seller Register OTP',
            html:`
            <p>You Successfully Registered.Wait for Admin Approval.Once Admin approved you can login you account.</p>
            <p>Your Registration OTP to Login : ${otp} </p>
            `,

        });
    }
}
