import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
const fs = require('fs');
const path = require('path');
@Injectable()
export class MailService {

    constructor(private mailService: MailerService){}
    sendEmail(name:string, title:String){
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../../assets/email/template.html'), 'utf-8');
        const htmlContent = htmlTemplate
        .replace('<placeholder1>', name)
        .replace('<placeholder2>', title);

        this.mailService.sendMail({
          from: 'OrbitFlow<Orbitflow@test.com>',
          to: 'arko466@gmail.com',
          subject: `Collaboration Invitation on OrbitFlow`,
          html: htmlContent
        });
    }
}
