import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UserGuard } from './common/guards/user.guard';
import { TopicModule } from './modules/topic/topic.module';
import { QuizModule } from './modules/quiz/quiz.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { InfoModule } from './modules/info/info.module';
import { ReportModule } from './modules/report/report.module';
import { AdminGuard } from './common/guards/admin.guard';
import { UserModule } from './modules/user/user.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    AuthModule,
    HealthModule,
    TopicModule,
    QuizModule,
    InfoModule,
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: join(__dirname, '/../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      throwOnMissingKey: true
    }),
    ReportModule,
    UserModule,
    WebhookModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'redis_local',
      port: 6379,
      ttl: 300, // Tiempo de vida en segundos (5 minutos por ejemplo)
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard,
    AdminGuard,
  ],
})
export class AppModule {}
