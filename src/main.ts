import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false
    }),
  );
  app.use(bodyParser.json({limit: '100mb'}));
  app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
