import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: emailDto.to,
        subject: emailDto.subject,
        text: emailDto.content,
        html: `<div>${emailDto.content}</div>`,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}
