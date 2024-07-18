import { Module } from '@nestjs/common';
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
        path: join(__dirname, '/i18n/'),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard,
    AdminGuard,
  ],
})
export class AppModule {}
