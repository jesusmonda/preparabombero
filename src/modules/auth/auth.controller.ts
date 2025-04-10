import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ResetPasswordAuthDto } from './dto/resetpassword-auth.dto';
import { RecoveryPasswordAuthDto } from './dto/recoverypassword-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const user: User = await this.authService.findOne(loginAuthDto.email);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
  
    const isMatch: boolean = await bcrypt.compare(loginAuthDto.password, user.password);
    if (!isMatch) {
      throw new HttpException('Contraseña incorrecta', HttpStatus.UNAUTHORIZED);
    }

    const access_token = await this.jwtService.signAsync({userId: user.id, role: user.role});
    return {access_token}
  }

  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    
    const user: User = await this.authService.findOne(registerAuthDto.email);
    if (user) {
      throw new HttpException('Usuario ya registrado', HttpStatus.BAD_REQUEST);
    }

    if (registerAuthDto.password !== registerAuthDto.repeatPassword) {
      throw new HttpException('Contraseña invalida', HttpStatus.BAD_REQUEST);
    }

    registerAuthDto.password = await bcrypt.hash(registerAuthDto.password, await bcrypt.genSalt());
    return await this.authService.create(registerAuthDto);
  }

  @Post('resetpassword')
  async resetPassword(@Body() resetPasswordAuthDto: ResetPasswordAuthDto) {
    return await this.authService.resetPassword(resetPasswordAuthDto);
  }

  @Post('recoverypassword')
  async recoveryPassword(@Body() recoveryPasswordAuthDto: RecoveryPasswordAuthDto) {
    return await this.authService.recoveryPassword(recoveryPasswordAuthDto);
  }
}
