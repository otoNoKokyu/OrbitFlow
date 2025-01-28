import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
const fs = require('fs');
const path = require('path');
@Injectable()
export class MailService {

  constructor(private mailService: MailerService) { }
  sendEmail(inviterName: string, projectTitle: String, userEmail: string, secretId?: string) {
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '../../assets/email/template.html'), 'utf-8');
    const htmlContent = htmlTemplate
      .replace('<placeholder1>', inviterName)
      .replace('<placeholder2>', projectTitle)
      .replace('<placeholder3>', secretId);

    this.mailService.sendMail({
      from: 'OrbitFlow<Orbitflow@test.com>',
      to: userEmail,
      subject: `Collaboration Invitation on OrbitFlow`,
      html: htmlContent
    });
  }
  async sendOtp(email: string, otp: number) {
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '../../assets/email/otpTemplate.html'), 'utf-8');
    const htmlContent = htmlTemplate
      .replace('<placeholder>', otp);

    this.mailService.sendMail({
      from: 'OrbitFlow<Orbitflow@test.com>',
      to: email,
      subject: `OTP >> Verify your Orbitflow Account`,
      html: htmlContent
    });
  }
  async sendResetPasswordLink({ name, email, resetLink }: { name: string, email: string, resetLink: string }) {
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '../../assets/email/resetPassword.html'), 'utf-8');
    const htmlContent = htmlTemplate
      .replace('<placeholder1>', name)
      .replace('<placeholder2>', resetLink);
    this.mailService.sendMail({
      from: 'OrbitFlow<Orbitflow@test.com>',
      to: email,
      subject: `Reset Password >> Reset Password for your Orbitflow Account`,
      html: htmlContent
    });
  }
}
