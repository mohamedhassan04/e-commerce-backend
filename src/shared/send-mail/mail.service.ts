import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { getForgotPasswordTemplate } from './templates/forgot-password.template';
import { getEmailVerificationTemplate } from './templates/activeAccount';
import { getEmailWelcomeTemplate } from './templates/welcome-email';
import { getOrderEmailTemplate } from './templates/order-email';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailForgotPassword(email: string, resetCode: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Réinitialisation de mot de passe',
        html: getForgotPasswordTemplate(resetCode),
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException(
        "Error lors de l'envoi de l'email",
      );
    }
  }

  async sendEmailCreateUserAccount(email: string, activeCode: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Vérification de votre compte',
        html: getEmailVerificationTemplate(activeCode),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Un probleme est survenu lors de l'envoi de l'email",
      );
    }
  }

  async sendWelcomeEmails(name: string, email: string, tempPassword: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenue sur notre plateforme',
        html: getEmailWelcomeTemplate(name, email, tempPassword),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Un probleme est survenu lors de l'envoi de l'email",
      );
    }
  }

  async sendOrderEmail(data: any) {
    try {
      await this.mailerService.sendMail({
        to: 'farouk.abdelkrim@gmail.com',
        subject: `Nouvelle Commande - N° ${data.ref || '2026/001'} - ${data.clientName}`,
        html: getOrderEmailTemplate(data),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Un probleme est survenu lors de l'envoi de l'email",
      );
    }
  }
}
