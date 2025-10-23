import { Controller, BadRequestException, Get, Body, Param, Delete, Post, UseGuards, HttpStatus, HttpException} from '@nestjs/common';
import { ReportService } from './report.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserGuard } from 'src/common/guards/user.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @UseGuards(AdminGuard)
  async findAll() {
    let report: any[] = await this.reportService.findAll();
    let quizzesId: number[] = report.map(x => x.quizId);
    let quizzes: QuizOmitResult[] = await this.reportService.findQuizzes(quizzesId);

    return report.map(report => {
      let response = {...report, quiz: quizzes.filter(y => y.id == report.quizId)[0]};
      return response;
    })
  }

  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    return await this.reportService.create(createReportDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    if (!id || id == '') {
      throw new HttpException('Id incorrecto', HttpStatus.BAD_REQUEST);
    }
    const idNumber: number = Number(id)
    if (isNaN(idNumber)) {
      throw new HttpException('Id incorrecto', HttpStatus.BAD_REQUEST);
    }

    let report = await this.reportService.findId(idNumber);
    if (report == null) {
      throw new HttpException('Reporte no encontrado', HttpStatus.NOT_FOUND);
    }

    return await this.reportService.delete(idNumber);
  }
}
