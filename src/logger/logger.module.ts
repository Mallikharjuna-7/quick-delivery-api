import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { LogController } from "./logs.controller";
import { AppLogger } from "./app-logger.service";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./logging.interceptors";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { RequestLoggerMiddleware } from "./request-logger.middleware";

@Module({
        controllers:[LogController],
        providers:[
                AppLogger,
                {provide:APP_INTERCEPTOR,useClass:LoggingInterceptor},
                {provide:APP_FILTER,useClass:AllExceptionsFilter},
        ],
        exports:[AppLogger],
})

export class LoggerModule implements NestModule {
        configure(consumer: MiddlewareConsumer) {
                consumer.apply(RequestLoggerMiddleware).forRoutes('*');
        }
}