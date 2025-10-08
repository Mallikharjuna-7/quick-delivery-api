import { Controller, Get, Query } from "@nestjs/common";
import { AppLogger } from "./app-logger.service";

@Controller('logs')
export class LogController {

        constructor(private readonly logger:AppLogger){}

        @Get('test')
        test(){
                this.logger.setContext('LogsController');
                this.logger.log('test log');
                this.logger.warn('test warn');
                this.logger.debug('test debug');
                this.logger.error('test error');
                return {ok:true};
        }
        
        @Get('level')
        setLevel(@Query('mode')mode:'dev'|'prod' = 'prod'){
                this.logger.setMode(mode);
                return(mode);
        }
}