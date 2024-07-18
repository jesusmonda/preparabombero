import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InfoOmitId } from 'src/common/interfaces/info.interface';
import { Info } from '@prisma/client';

@Injectable()
export class InfoService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getAll() : Promise<InfoOmitId>{
    return await this.prisma.info.findUnique({
      select: {
        title: true,
        description: true
      },
      where: {
        id: 0
      }
    });
  }

  async update(updateInfoDto: UpdateInfoDto) : Promise<InfoOmitId> {
    let response: Info = await this.prisma.info.update({
      where:{
        id: 0
      },
      data: updateInfoDto
    });
    delete response?.id;
    return response;
  }

  async create(updateInfoDto: UpdateInfoDto) : Promise<Info> {
    return await this.prisma.info.create({
      data: updateInfoDto
    });
  }
}
