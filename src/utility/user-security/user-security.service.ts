import { Inject, Injectable } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { ServiceException } from "src/helper/CustomError";
import { ERR_TYPE } from "src/interface/CustomError";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class UserSecurityService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
        private redisService: RedisService,
        private mailService: MailService,
    ) {}

    async sendOtp({ resend, email }: { resend: boolean, email: string }) {
        const resendOtp = Math.floor(10000 + Math.random() * 90000)
        const newDate = new Date(new Date().getTime() + 2 * 60 * 1000);
        const newUnixTime = Math.floor(newDate.getTime() / 1000);
        if (resend) {
            const doesExist = await this.redisService.getTempData(email)
            if (!doesExist) this.serviceException.throw('RESOURCE_CONFLICT','profile not found')
            await this.redisService.setTempData(email, { ...doesExist, otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        } else await this.redisService.setTempData(email, { otp: resendOtp, otpExpiresAt: newUnixTime }, 1800)

        await this.mailService.sendOtp(email, resendOtp)
        return { expiresIn: newUnixTime }
    }
    async verify({ email, otp }: { email: string, otp: number }): Promise<string> {
        const tempUserData = await this.redisService.getTempData(email)
        if (!tempUserData) this.serviceException.throw('RESOURCE_CONFLICT','data not found')
        const currentUnixTime = Math.floor(Date.now() / 1000)
        if (Math.abs(currentUnixTime - tempUserData.otpExpiresAt) > 300) throw Error('otp expired')
        if (otp !== tempUserData?.otp) this.serviceException.throw('RESOURCE_CONFLICT','otp mismatched')
        return 'otp verified';
    }
}