import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let error = 'InternalServerError';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            // HttpException#getResponse can be string or object
            if (typeof res === 'string') {
                message = res;
            } else if (res && typeof res === 'object') {
                // prefer message field if present
                message = (res as any).message ?? (res as any).error ?? res;
            } else {
                message = res;
            }
            error = (exception as any).name ?? 'HttpException';
        } else {
            // Non-HttpException: log for debug
            this.logger.error('Non-HTTP exception thrown', exception as any);
        }

        const payload = {
            status,
            error,
            message,
            path: request?.url,
            timestamp: new Date().toISOString(),
        };

        response.status(status).json(payload);
    }
}
