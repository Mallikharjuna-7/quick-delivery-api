import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { AppLogger } from "src/logger/app-logger.service";

@Injectable()
export class MailService {
    private transporter;

    constructor(private readonly logger: AppLogger) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "malli.test6162@gmail.com",
                pass: "rpso pmgq whlg wiys",
            },
        });

        this.logger.setContext(MailService.name);
    }

    async sendWelcomeEmail(to: string, role: string) {
        const subject = `Welcome ${role === "customer" ? "Customer" : "Delivery Partner"}`;

        const message =
            role === "customer"
                ? `Hi! Thank you for registering as a valued customer.`
                : `Hi! Thank you for registering as a valued Delivery Partner.`;

        const mailOptions = {
            from: "malli.test6162@gmail.com",
            to,
            subject,
            html: `<h2>${subject}</h2> <p>${message}</p>`,
        };

        this.logger.log({ action: "sendWelcomeEmail", to, role });
        return this.transporter.sendMail(mailOptions);
    }

    async sendResetPasswordEmail(to: string, resetLink: string) {
        this.logger.log({ action: "sendResetPasswordEmail", to });

        await this.transporter.sendMail({
            to,
            subject: "Reset Your Password",
            html: `
            <p>You requested to reset your password.</p>
            <p>Click <a href="${resetLink}">here</a> to reset. This link is valid for 15 minutes only.</p>
            `,
        });

        this.logger.log({ action: "sendResetPasswordEmail", message: "Mail sent", to });
    }

    async sellerWelcomeEmail(to: string, otp: string) {
        this.logger.log({ action: "sellerWelcomeEmail", to });

        await this.transporter.sendMail({
            to,
            subject: "Seller Register OTP",
            html: `
            <p>You successfully registered. Wait for Admin Approval. Once Admin approves, you can login.</p>
            <p>Your Registration OTP to Login: ${otp}</p>
            `,
        });

        this.logger.log({ action: "sellerWelcomeEmail", message: "Mail sent", to });
    }

    async sendApprovalMail(to: string) {
        this.logger.log({ action: "sendApprovalMail", to });

        await this.transporter.sendMail({
            to,
            subject: "Your Seller Request is Approved",
            html: `
            <p>You can now log in to the Quick Delivery App as a seller.</p>
            `,
        });

        this.logger.log({ action: "sendApprovalMail", message: "Mail sent", to });
    }
}
