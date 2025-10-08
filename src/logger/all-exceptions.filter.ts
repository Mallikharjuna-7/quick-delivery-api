import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { AppLogger } from "./app-logger.service";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
       
        constructor(private readonly logger: AppLogger){}

        catch(exception:unknown, host:ArgumentsHost){
                const ctx = host.switchToHttp();
                const res = ctx.getResponse<Response>();
                const req = ctx.getRequest<Request & { requestId?:string}>();
                const rid = req.requestId??'n/a';

                if(exception instanceof HttpException){
                        const status = exception.getStatus();
                        const body = exception.getResponse();
                        this.logger.setContext('EXCEPTION');
                        this.logger.error(`HTTP ${status} rid=${rid} body=${JSON.stringify(body)}`);

                        return res.status(status).json(typeof body === 'string'?{message:body}:body);
                }

                const status = HttpStatus.INTERNAL_SERVER_ERROR;
                const msg = exception instanceof Error ? exception.message : String(exception);
                const stack = exception instanceof Error ? exception.stack : undefined;

                this.logger.setContext('EXCEPTION');
                this.logger.error(`Unhandled rid=${rid} message=${msg}${stack ? `\n${stack}`:''}`);

                return res.status(status).json({statusCode:status, message:`Internal server error`});
        }
}