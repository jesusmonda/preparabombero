import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import databaseConfig from './database/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuizModule } from './modules/quiz/quiz.module';
import { UserGuard } from './common/guards/user.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => (configService.get('typeorm'))
    }),
    AuthModule,
    HealthModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserGuard
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
