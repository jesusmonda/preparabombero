import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UserGuard } from './common/guards/user.guard';
import { TopicModule } from './modules/topic/topic.module';
import { QuizModule } from './modules/quiz/quiz.module';
import {
  I18nModule,
} from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    HealthModule,
    TopicModule,
    QuizModule,
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      throwOnMissingKey: true
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard
  ],
})
export class AppModule {}
