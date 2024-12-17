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

@Injectable()
export class UserService {


    constructor(
        @Inject(RoleService)
        @Inject(ProjectService)
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        private roleService: RoleService,
        private projectService: ProjectService
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

    async validateEmailUpdate(payload: Partial<CredentialInfo>) {
        try {
            if(!isEmail(payload.email)) return 'invalid email';// throw new BadRequestException('Invaild email format!');
            const userWithSameEmail = await User.findOne({where: {email: payload.email}});
            if(userWithSameEmail) return 'user with same email already exists!';
            return '';
        } catch (err) {
            throw Error(err);
        }
    }

    async updateUserEmail(payload: {email: string, userId: string}) {
        try {
            const user = await User.findOne({where: {user_id: payload.userId}});
            if(!user) throw new NotFoundException('user is not found!');
            await user.update({email: payload.email});
        } catch {
            throw new BadRequestException();
        }
    }

    async editUserProfile(payload: UserDTO) : Promise<void> {
        try {
            const user = await User.findOne({where: {user_id: payload.user_id}});
            if(!user) throw new NotFoundException('user not found!');
            const updatedPersonalInfo : PersonalInfo = {...payload, date_of_birth: new Date(payload.date_of_birth)};
            await user.update(updatedPersonalInfo);
        } catch {
            throw new BadRequestException();
        }
    }
}
