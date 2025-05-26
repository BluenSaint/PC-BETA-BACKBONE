import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST', 'smtp.example.com'),
          port: configService.get('MAIL_PORT', 587),
          secure: configService.get('MAIL_SECURE', false),
          auth: {
            user: configService.get('MAIL_USER', 'user@example.com'),
            pass: configService.get('MAIL_PASSWORD', 'password'),
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM', '"PC Beta Backbone" <noreply@pcbetabackbone.com>'),
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
