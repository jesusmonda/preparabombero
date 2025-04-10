import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { PrismaService } from 'src/common/services/database.service';
import { User } from '@prisma/client';
import { ResetPasswordAuthDto } from './dto/resetpassword-auth.dto';
import { RecoveryPasswordAuthDto } from './dto/recoverypassword-auth.dto';
import * as bcrypt from 'bcryptjs';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

@Injectable()
export class AuthService {

  private sesClient: SESClient;

  constructor(
    private prisma: PrismaService
  ) {
    this.sesClient = new SESClient({
      region: "eu-west-1",
    });
  }

  async findOne(email: string) : Promise<User>{
    return await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });
  }

  async create(registerAuthDto: RegisterAuthDto) : Promise<User>{
    delete registerAuthDto.repeatPassword;
    registerAuthDto.email = registerAuthDto.email.toLowerCase();
    let response: User = await this.prisma.user.create({
      data: registerAuthDto
    })
    delete response.password;
    return response;
  }

  async resetPassword(resetPasswordAuthDto: ResetPasswordAuthDto) {
    const user: User = await this.findOne(resetPasswordAuthDto.email);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.BAD_REQUEST);
    }

    // send email
    await this.sendEmail(user.email, "Recuperar contraseña de preparabombero", `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Restablece tu contraseña</h2>
      <p style="color: #555;">
        Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para continuar:
      </p>
      <a
        href="https://preparabombero.com/recovery-password/${user.token}"
        style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;"
      >
        Restablecer contraseña
      </a>
      <p style="color: #999; font-size: 12px;">
        Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
    </div>
  </body>
</html>`);

    return;
  }

  async recoveryPassword(recovertPasswordAuthDto: RecoveryPasswordAuthDto) {
    const user: User = await this.prisma.user.findFirst({
      where: {
        token: recovertPasswordAuthDto.token
      }
    });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.BAD_REQUEST);
    }

    if (recovertPasswordAuthDto.password !== recovertPasswordAuthDto.repeatPassword) {
      throw new HttpException('Contraseña invalida', HttpStatus.BAD_REQUEST);
    }

    let password = await bcrypt.hash(recovertPasswordAuthDto.password, await bcrypt.genSalt());

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: password
      }
    });

    return;
  }

  async sendEmail(to: string, subject: string, htmlBody: string) {
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: "no-reply@preparabombero.com"
    };

    const command = new SendEmailCommand(params);
    return await this.sesClient.send(command);
  }
}
