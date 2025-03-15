import { Inject, Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { UserRepository } from './user.repository';
import { ProjectService } from '../project/project.service';
import { MailService } from 'src/utility/mail/mail.service';
import { JwtEncodables, TAppUser } from 'src/utility/utility.type';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { UserProjectService } from '../project/userProject.service';
import { BaseService } from 'src/common/service.base';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { isEmail } from 'class-validator';
import { UserSecurityService } from 'src/utility/user-security/user-security.service';
import { CredentialInfo, EditTEntityUser, PersonalInfo } from './types/user.types';
import { TInvite } from '../auth/types/auth.types';


@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
        private userRepository: UserRepository,
        private projectService: ProjectService,
        private userProjectService: UserProjectService,
        private mailService: MailService,
        private jwtService: JwtService,
        private userSecurityService : UserSecurityService,
    ) {
        super(userRepository)
    }
    async create(user: ModelCreationAttributes<User>) {
        const dob = user.date_of_birth ? new Date(user.date_of_birth) : null;
        delete user.date_of_birth;
        return await this.userRepository.create({ ...user, date_of_birth: dob });
    }
    async me(userId: string) {
        return await this.userRepository.findOne({ user_id: userId })
    }
    async invite(
        { roleId, pId, email, username, userId }: Omit<TAppUser,'role'> & TInvite,
    ): Promise<string> {
        const project = await this.projectService.findOne({ id: pId });
        if (!project) this.serviceException.throw('RESOURCE_CONFLICT', 'no project found');
        const userProject = await this.userProjectService.findAll({
            projectId: pId,
            roleId,
            userId
        })
        if (userProject.length) this.serviceException.throw('RESOURCE_CONFLICT', "User already present in Project")
        const encodeBody = {
            projectId: pId,
            roleId,
            inviterId: userId,
        };
        const secretInvitationId = await this.jwtService.sign(encodeBody, JwtEncodables.INVITE);
        this.mailService.sendEmail(username, project.name, email, secretInvitationId);
        return 'invitation sent';
    }
    async getUserMeData(userId: string) {
        const query = `
        SELECT 
        u.username,
        u.user_id,
        u.phone_number,
        u.email,
        p.name AS project,
        p.id AS projectId,
        r.role AS role
        FROM 
        users u
        LEFT JOIN 
        user_projects up ON u.user_id = up.userId
        LEFT JOIN 
        projects p ON up.projectId = p.id
        LEFT JOIN 
        roles r ON up.roleId = r.role_id
        WHERE u.user_id = '${userId}'
        `
        const result = await this.userRepository.rawQuery(query)
        return result.reduce((acc, user) => {
            let existingUser = acc.find(u => u.user_id === user.user_id);
            if (!existingUser) {
                existingUser = {
                    username: user?.username,
                    user_id: user?.user_id,
                    phone_number: user?.phone_number,
                    email: user?.email,
                    role: user?.role,
                    projects: [],
                };
                acc.push(existingUser);
            }
            existingUser.projects.push({
                project: user?.project,
                projectId: user?.projectId
            });

            return acc;
        }, [])[0]

    }

    async validateEmailUpdate(payload: { info: Partial<CredentialInfo>, model: EditTEntityUser }) {
        if (!isEmail(payload.info.email)) return this.serviceException.throw('REQ_MALFORMED', 'invalid email!');
        const userWithSameEmail = await this.findOne({ email: payload.model.email });
        if (userWithSameEmail) this.serviceException.throw('RESOURCE_CONFLICT', 'user with same email already exists!');
        await this.userSecurityService.sendOtp({resend: false, email: payload.info.email })
    }

    async updateUserEmail(payload: EditTEntityUser) {
        const user = await this.findOne({user_id: payload.user_id});
        if (!user) this.serviceException.throw('NOT_FOUND', 'user not found!');
        this.validateEmailUpdate({ info: { email: user.email }, model: payload });
        await this.userRepository.update({ email: payload.email }, { user_id: user.id });
    }

    async editUserProfile(payload: EditTEntityUser): Promise<void> {
        this.updateUserEmail(payload);
        const updatedPersonalInfo: PersonalInfo = { ...payload, date_of_birth: new Date(payload.date_of_birth) };
        await this.userRepository.update(updatedPersonalInfo, { user_id: payload.user_id });
    }
}
