import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './model/User.model';
import { Op, Sequelize } from 'sequelize';
import { Roles } from 'src/modules/role/model/roles.model';
import { RoleService } from 'src/modules/role/role.service';
import { UserDTO } from '../auth/dto/signup.dto';
import { ProjectService } from '../project/project.service';
import { UUID } from 'crypto';
import { CredentialInfo, EditUserDto, PersonalInfo } from './dto/edit.user.profile.dto';
import { isEmail } from 'class-validator';
import { HttpService } from '@nestjs/axios';
import { emit } from 'process';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {


    constructor(
        @Inject(RoleService)
        @Inject(ProjectService)
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        private roleService: RoleService,
        private projectService: ProjectService,
        private httpService: HttpService
    ) { }

    async findOne(id: string): Promise<User | null> {
        const user = await User.findOne({
            where: { user_id: id }
        });
        return user
    }
    async findByCredential(credential: Partial<User>): Promise<User | null> {
        const user = await User.findOne({
            where: credential,
            include: [{ model: Roles }],
        })
        return user
    }
    async findDuplicateUser({ username, email, phone_number, first_name }: Partial<User>): Promise<Boolean> {
        const user = await User.findAll({
            where: {
                [Op.or]: [{ username }, { email }, { phone_number }, { first_name }]
            }
        })
        if (user.length) return true
        else return false
    }
    async createUser(user: Partial<UserDTO>, meta?: {assigned_role:string, projectId:string}): Promise<User> {
        const roleExists = await this.roleService.findRole(meta?.assigned_role || user?.assigned_role)
        if (!roleExists) throw Error('No role found')
        delete user.assigned_role
        const dob = new Date(user.date_of_birth)
        delete user.date_of_birth
        let userData
        try{
             userData = await User.create({ ...user, roleId: roleExists.role_id, date_of_birth:dob })

        }catch(err){
            console.log(err)

        }
        if (meta) {
            await this.projectService.createUserProject({
                userId: userData.user_id,
                roleId: userData.roleId,
                isActive: true,
                projectId: meta.projectId
            })
        }
        return userData

    }
    async findOneById(id:UUID): Promise<User> {
        const userData = await User.findOne({
            where: {user_id: id}
        })
        if(!userData) throw Error('user not found')
        return userData

    }
    async updateUserTokens(access_token: string, refresh_token: string, userId: string): Promise<void> {

        await User.update(
            { access_token, refresh_token },
            { where: { user_id: userId } }
        );
    }

    async validateEmailUpdate(payload: {info: Partial<CredentialInfo>, model: UserDTO}) {
        try {
            if(!isEmail(payload.info.email)) return new Error ('invalid email');
            const userWithSameEmail = await User.findOne({where: {email: payload.info.email}});
            if(userWithSameEmail) return new Error('user with same email already exists!');
            await firstValueFrom(this.httpService.post('/auth/sendOTP', {resend: false, user:  payload.model, eamil: payload.info.email}));
        } catch (err) {
            throw Error(err);
        }
    }

    async updateUserEmail(payload: UserDTO) {
        try {
            const user = await User.findOne({where: {user_id: payload.user_id}});
            if(!user) throw Error('user not found!');
            this.validateEmailUpdate({info: {email: payload.email}, model: payload});
            await user.update({email: payload.email});
        } catch {
            throw new Error();
        }
    }

    async editUserProfile(payload: UserDTO) : Promise<void> {
        try {
            this.updateUserEmail(payload);
            const updatedPersonalInfo : PersonalInfo = {...payload, date_of_birth: new Date(payload.date_of_birth)};
            await User.update(updatedPersonalInfo, {where: {user_id: payload.user_id}});
        } catch {
            throw new Error();
        }
    }
}
