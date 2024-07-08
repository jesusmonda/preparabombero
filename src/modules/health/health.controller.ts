import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from 'src/common/services/database.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prismaService),
    ]);
  }
}