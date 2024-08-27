import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/common/services/database.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: "Mak7x6A0PXB3ssS7UANV",
      signOptions: { expiresIn: '10d' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
