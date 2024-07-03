import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const user: User = await this.authService.findOne(loginAuthDto.email);
    if (!user) {
      throw new HttpException('Not found user', HttpStatus.NOT_FOUND);
    }
  
    const isMatch: boolean = await bcrypt.compare(loginAuthDto.password, user.password);
    if (!isMatch) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    const access_token = await this.jwtService.signAsync({userId: user.id, role: user.role});
    return {access_token, role: user.role}
  }

  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    
    const user: User = await this.authService.findOne(registerAuthDto.email);
    if (user) {
      throw new HttpException('Found user', HttpStatus.BAD_REQUEST);
    }

    registerAuthDto.password = await bcrypt.hash(registerAuthDto.password, await bcrypt.genSalt());
    await this.authService.create(registerAuthDto);
  }
}
