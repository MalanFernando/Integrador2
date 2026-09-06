import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Security');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip: string;
      user?: { id: string; email: string };
    }>();
    const { method, url, ip, user } = request;

    const sensitiveRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];
    const isSensitive = sensitiveRoutes.some((route) => url.includes(route));

    if (isSensitive) {
      this.logger.log(
        `${method} ${url} from ${ip} user=${user?.email ?? 'anonymous'}`,
      );
    }

    return next.handle().pipe(
      tap({
        error: (err: Error) => {
          if (isSensitive) {
            this.logger.warn(`${method} ${url} FAILED: ${err.message}`);
          }
        },
      }),
    );
  }
}
