import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailerOpts } from 'src/common';

@Injectable()
export class MailingService {
  constructor(private config: ConfigService) {}

  async sendEmail(data: IMailerOpts) {
    const transporter = await nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        pass: this.config.get('ETH_PASS'),
        user: this.config.get('ETH_EMAIL'),
      },
    });

    const info = await transporter.sendMail({
      from: 'authApp.gmail.com',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview Url: %s', nodemailer.getTestMessageUrl(info));
  }
}
