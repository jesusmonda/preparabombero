import { Controller, Inject, Request, UseInterceptors, Body, Get, Put, UseGuards } from '@nestjs/common';
import { InfoService } from './info.service';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InfoOmitId } from 'src/common/interfaces/info.interface';
import { UserGuard } from 'src/common/guards/user.guard';
import { CacheInterceptor } from 'src/common/interceptors/cache.interceptor';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('info')
export class InfoController {
  constructor(
    private readonly infoService: InfoService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get('')
  @UseInterceptors(CacheInterceptor)
  async findAll() {
    let response: InfoOmitId = await this.infoService.getAll();
    if (response == null) {
      await this.infoService.create({title: '', description: ''});
      return {title: '', description: ''}
    }

    return response;
  }

  @Put('')
  @UseGuards(UserGuard)
  async update(@Body() updateInfoDto: UpdateInfoDto, @Request() request) {
    const response = await this.infoService.update(updateInfoDto);

    console.log(`userId:${request['user'].userId}:endpoint:/info set cache`)
    await this.cacheManager.set(`userId:${request['user'].userId}:endpoint:/info`, response);

    return response;
  }
}
