import { Injectable, Inject, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CacheInterceptor implements NestInterceptor {

  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private jwtService: JwtService
    ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const access_token = request.headers.authorization.split('Bearer ')[1] ?? undefined;
    let decoded;
    if (access_token) {
      decoded = await this.jwtService.verifyAsync(
        access_token,
        {
          secret: process.env.JWT_SECRET
        }
      );

      const value = await this.cacheManager.get(`userId:${decoded.userId}:endpoint:${request.path}`);
      if (value != null) {
        console.log(`userId:${decoded.userId}:endpoint:${request.path} get from cache`)
        return of(value)
      }
    }

    return next.handle().pipe(
      tap(async response => {
        console.log(`userId:${decoded.userId}:endpoint:${request.path} set cache`)
        await this.cacheManager.set(`userId:${decoded.userId}:endpoint:${request.path}`, response);
      })
    );
  }
}