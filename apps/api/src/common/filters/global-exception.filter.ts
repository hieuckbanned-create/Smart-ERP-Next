import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../errors/error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<any>();
    const requestId = request?.requestId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as any;
        if (resp.errorCode) errorCode = resp.errorCode;
        message = resp.message ?? message;
        if (Array.isArray(message)) message = message.join('; ');
      } else {
        message = typeof exResponse === 'string' ? exResponse : message;
      }

      if (status === HttpStatus.NOT_FOUND && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.NOT_FOUND;
      } else if (status === HttpStatus.CONFLICT && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.CONFLICT;
      } else if (status === HttpStatus.FORBIDDEN && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.FORBIDDEN;
      } else if (status === HttpStatus.UNAUTHORIZED && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.UNAUTHORIZED;
      } else if ((status === HttpStatus.BAD_REQUEST || status === HttpStatus.UNPROCESSABLE_ENTITY) && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.VALIDATION_ERROR;
      } else if (status === HttpStatus.TOO_MANY_REQUESTS && !(exResponse as any).errorCode) {
        errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
      }
    }

    response.status(status).json({
      success: false,
      data: null,
      error: message,
      errorCode,
      requestId,
    });
  }
}
