import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { PackController } from './pack.controller';
import { PackService } from './pack.service';

@Module({
  controllers: [PackController],
  providers: [PackService, PrismaService],
  exports: [PackService],
})
export class PackModule {}
