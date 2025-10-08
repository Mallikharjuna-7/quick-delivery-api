import { ConsoleLogger, Injectable, LogLevel } from "@nestjs/common";

@Injectable()
export class AppLogger extends ConsoleLogger {
  private mode: "prod" | "dev" = "prod";

  setMode(mode: "prod" | "dev" = "prod") {
    this.mode = mode;
  }

  private format(level: string, message: any, meta: Record<string, any> = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component: this.context, // inherited from ConsoleLogger
      message,
      ...meta,
    });
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(this.format("info", message), ...optionalParams);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(this.format("error", message, { stack }), stack, context);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(this.format("warn", message), ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.mode === "dev") {
      super.debug(this.format("debug", message), ...optionalParams);
    }
  }
}