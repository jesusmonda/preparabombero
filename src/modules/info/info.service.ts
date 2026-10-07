import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InfoOmitId } from 'src/common/interfaces/info.interface';
import { Info, Prisma } from '@prisma/client';

@Injectable()
export class InfoService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getAll(): Promise<InfoOmitId> {
    return await this.prisma.info.findUnique({
      select: {
        title: true,
        description: true,
        announcementData: true,
      },
      where: {
        id: 0
      }
    });
  }

  async update(updateInfoDto: UpdateInfoDto): Promise<InfoOmitId> {
    const data: Prisma.InfoUpdateInput = {};

    if (updateInfoDto.title !== undefined) {
      data.title = updateInfoDto.title;
    }

    if (updateInfoDto.description !== undefined) {
      data.description = updateInfoDto.description;
    }

    if (updateInfoDto.announcementData !== undefined) {
      data.announcementData = JSON.parse(
        JSON.stringify(updateInfoDto.announcementData),
      ) as Prisma.InputJsonValue;
    }

    return await this.prisma.info.upsert({
      where: { id: 0 },
      create: {
        id: 0,
        title: updateInfoDto.title ?? '',
        description: updateInfoDto.description ?? '',
        announcementData: data.announcementData,
      },
      update: data,
    });
  }

  async create(updateInfoDto: UpdateInfoDto) : Promise<Info> {
    return await this.prisma.info.create({
      data: {
        title: updateInfoDto.title ?? '',
        description: updateInfoDto.description ?? '',
        announcementData: updateInfoDto.announcementData
          ? (JSON.parse(JSON.stringify(updateInfoDto.announcementData)) as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }
}
