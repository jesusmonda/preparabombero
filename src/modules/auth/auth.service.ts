import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(email: string) : Promise<User>{
    return await this.userRepository.findOneBy({email: email});
  }

  async create(registerAuthDto: RegisterAuthDto) : Promise<User>{
    const newUser = this.userRepository.create(registerAuthDto)
    return this.userRepository.save(newUser);
  }
}
