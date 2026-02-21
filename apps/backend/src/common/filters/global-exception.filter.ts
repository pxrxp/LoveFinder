import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message };

    const message =
      typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).message
        ? (exceptionResponse as any).message
        : exceptionResponse;

    const error =
      typeof exceptionResponse === 'object' && (exceptionResponse as any).error
        ? (exceptionResponse as any).error
        : exception instanceof HttpException
          ? exception.name
          : 'Internal Server Error';

    const errorResponse = {
      statusCode: status,
      error,
      message: status >= 500 ? 'Internal server error' : message,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`,
        (exception as Error).stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
