import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UserGuard } from './common/guards/user.guard';
import { TopicModule } from './modules/topic/topic.module';

@Module({
  imports: [
    AuthModule,
    HealthModule,
    TopicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard
  ],
})
export class AppModule {}
