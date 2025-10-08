import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppLogger } from './logger/app-logger.service';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{bufferLogs:true});

  app.useStaticAssets(join(__dirname,'..','uploads'),{prefix:'/uploads/',});

  const appLogger = app.get(AppLogger);
  app.useLogger(appLogger);

  await app.listen(3000);

  appLogger.setContext('Bootstrap');
  appLogger.log(`Server listening on 3000`);
}
bootstrap();
