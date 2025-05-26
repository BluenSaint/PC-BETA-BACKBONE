import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, headers } = request;
        
        // Sanitize sensitive data from logs
        const sanitizedBody = { ...body };
        if (sanitizedBody.password) sanitizedBody.password = '***';
        
        this.logger.error(
          `Error in ${method} ${url}: ${error.message}`,
          {
            error: error.stack,
            body: sanitizedBody,
          },
        );

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        return throwError(() => new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ));
      }),
    );
  }
}
