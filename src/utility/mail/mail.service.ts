import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationIssueType } from 'src/modules/notification/types/notification.types';
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
  async sendIssueNotification(recipient: string, issue: Partial<NotificationIssueType>) {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, '../../assets/email/issueNotification.html'),
      'utf-8',
    );

    let htmlContent = htmlTemplate;

    Object.keys(issue).forEach((key) => {
      const placeholder = `{{${key}}}`;
      const value = issue[key] ? String(issue[key]) : ''; 
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    });

    htmlContent = htmlContent.replace(/{{[^}]+}}/g, '');

    await this.mailService.sendMail({
      to: recipient,
      subject: `Orbitflow Issue Update: ${issue.projectIssueId || 'No ID'}`,
      html: htmlContent,
    });
  }
}
