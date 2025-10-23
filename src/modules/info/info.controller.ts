import { Controller, Body, Get, Put, UseGuards } from '@nestjs/common';
import { InfoService } from './info.service';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InfoOmitId } from 'src/common/interfaces/info.interface';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('')
  async findAll() {
    let response: InfoOmitId = await this.infoService.getAll();
    if (response == null) {
      await this.infoService.create({title: '', description: ''});
      return {title: '', description: ''}
    }

    return response;
  }

  @Put('')
  @UseGuards(AdminGuard)
  async update(@Body() updateInfoDto: UpdateInfoDto) {
    return await this.infoService.update(updateInfoDto);
  }
}
