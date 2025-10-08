import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { AppLogger } from "./app-logger.service";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

        constructor(private readonly logger:AppLogger){}

        intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

                const handler = `${context.getClass().name}.${context.getHandler().name};`
                const started = Date.now();

                this.logger.setContext(handler);
                this.logger.debug('start');

                return next.handle().pipe(
                        tap({
                                next:() => this.logger.debug(`done $ {Date.now() - started}ms`),
                                error:(err) => this.logger.error(`error after $ {Date.now() - started}ms:${err?.message || err}`),
                        }),
                );
        }
}