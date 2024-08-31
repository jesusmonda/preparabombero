import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { PrismaService } from 'src/common/services/database.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService
  ) {}

  async findOne(email: string) : Promise<User>{
    return await this.prisma.user.findUnique({
      where: {
        email: email
      }
    });
  }

  async create(registerAuthDto: RegisterAuthDto) : Promise<User>{
    delete registerAuthDto.repeatPassword;
    let response: User = await this.prisma.user.create({
      data: registerAuthDto
    })
    delete response.password;
    return response;
  }
}
