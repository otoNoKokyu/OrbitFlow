import { Inject, Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { UserRepository } from './user.repository';
import { UserDTO } from '../auth/dto/signup.dto';
import { RoleService } from '../role/role.service';
import { ProjectService } from '../project/project.service';
import { RoleEnum } from '../role/utility/roles.enum';
import { WhereOptions } from 'sequelize';
import { MailService } from 'src/utility/mail/mail.service';
import { JwtEncodables } from 'src/utility/utility.type';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';

@Injectable()
export class UserService {
    constructor(
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
         private userRepository: UserRepository,
         private roleService: RoleService,
         private projectService: ProjectService,
        private mailService: MailService,
        private jwtService: JwtService
    ) { }
    async createUser(user: UserDTO, meta?: { projectId: string }): Promise<User> {
        let roleId = user.roleId;
        if (!roleId) {
            const guestRole = await this.roleService.findRole(RoleEnum.ADMIN);
            if (!guestRole) this.serviceException.throw('RESOURCE_CONFLICT','Guest role not found');
            roleId = guestRole.role_id;
        } else {
            const roleExists = await this.roleService.findRole(roleId);
            if (!roleExists) this.serviceException.throw('RESOURCE_CONFLICT','No role found');
        }
        const dob = user.date_of_birth ? new Date(user.date_of_birth) : null;
        delete user.date_of_birth;
        let userData;
        try {
            userData = await User.create({ ...user, roleId, date_of_birth: dob });
        } catch (err) {
            console.error('Error creating user:', err);
            throw Error('Failed to create user');
        }
        if (meta) await this.projectService.createUserProject({
            userId: userData.user_id,
            roleId: userData.roleId,
            isActive: true,
            projectId: meta.projectId
        });
        return userData;
    }
    async me(userId:string): Promise<User>{
        return await this.userRepository.findOne({user_id:userId})
    }
    async  invite(
        { roleId, pId, email, username,userId }: { roleId: string; pId: string, email:string, username:string,userId:string },
    ): Promise<string> {
        const project = await this.projectService.findProjectById(pId);
        if (!project) this.serviceException.throw('RESOURCE_CONFLICT','no project found');
        const userProject = await this.projectService.findUserProjects({projectId:pId,roleId})
        if(userProject.length) this.serviceException.throw('RESOURCE_CONFLICT',"User already present in Project")
        const encodeBody = {
            projectId: pId,
            roleId,
            inviterId: userId,
        };
        const secretInvitationId = await this.jwtService.sign(encodeBody, JwtEncodables.INVITE);
        this.mailService.sendEmail(username, project.name, email, secretInvitationId);
        return 'invitation sent';
    }
    
    async findByCredential(query: Partial<User> ): Promise<User | null> {
        return await this.userRepository.findOne(query)
    }
    async update(payload: Partial<User>,condition:WhereOptions<Partial<User>>) {
        return await this.userRepository.updateUser({payload,condition})
    }
}
