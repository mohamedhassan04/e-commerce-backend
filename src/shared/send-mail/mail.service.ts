import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { getForgotPasswordTemplate } from './templates/forgot-password.template';
import { getEmailVerificationTemplate } from './templates/activeAccount';
import { getEmailWelcomeTemplate } from './templates/welcome-email';
import { getOrderEmailTemplate, OrderEmailData } from './templates/order-email';
import {
  getOrderStatusUpdateTemplate,
  OrderStatusUpdateEmailData,
} from './templates/order-status-update';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailForgotPassword(email: string, resetCode: string, language: 'cz' | 'en' = 'en') {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: language === 'cz' ? 'Obnovení hesla' : 'Password reset',
        html: getForgotPasswordTemplate(resetCode, language),
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException(
        "Error lors de l'envoi de l'email",
      );
    }
  }

  async sendEmailCreateUserAccount(email: string, activeCode: string, language: 'cz' | 'en' = 'en') {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: language === 'cz' ? 'Ověření účtu' : 'Verify your account',
        html: getEmailVerificationTemplate(activeCode, language),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Un probleme est survenu lors de l'envoi de l'email",
      );
    }
  }

  async sendWelcomeEmails(name: string, email: string, tempPassword: string, language: 'cz' | 'en' = 'en') {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: language === 'cz' ? 'Vítejte na naší platformě' : 'Welcome to our platform',
        html: getEmailWelcomeTemplate(name, email, tempPassword, language),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Un probleme est survenu lors de l'envoi de l'email",
      );
    }
  }

  async sendOrderStatusUpdateEmail(
    to: string,
    data: OrderStatusUpdateEmailData,
  ) {
    await this.mailerService.sendMail({
      to,
      subject: `${data.language === 'cz' ? 'Aktualizace stavu objednávky' : 'Order Status Update'} - ${data.ref}`,
      html: getOrderStatusUpdateTemplate(data),
    });
  }

  async sendOrderEmail(to: string, data: OrderEmailData) {
    await this.mailerService.sendMail({
      to,
      subject: `${data.language === 'cz' ? 'Potvrzení objednávky' : 'Order Confirmation'} - ${data.ref}`,
      html: getOrderEmailTemplate(data),
    });
  }
}
