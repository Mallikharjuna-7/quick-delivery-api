import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from './app-logger.service';
import { randomUUID } from 'crypto';

// Extend Express Request to include requestId
interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: RequestWithId, res: Response, next: NextFunction) {
    // generate a requestId for tracking
    req.requestId = randomUUID();

    // set logger context for this request
    this.logger.setContext('RequestLogger');

    // Log incoming request
    this.logger.log('Incoming request', {
      method: req.method,
      url: req.originalUrl,
      requestId: req.requestId,
    });

    // Log when response is finished
    res.on('finish', () => {
      this.logger.log('Request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        requestId: req.requestId,
      });
    });

    next();
  }
}
