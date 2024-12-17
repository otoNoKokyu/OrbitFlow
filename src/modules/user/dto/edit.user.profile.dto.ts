import { UserDTO } from "src/modules/auth/dto/signup.dto";

export type EditUserDto = Omit<UserDTO, 'password_hash' | 'user_id'>;
export type CredentialInfo = Pick<UserDTO, 'password_hash' | 'email' | 'phone_number'>;
export type PersonalInfo = Omit<EditUserDto, 'email'| 'phone_number' | 'username' | 'date_of_birth'> & {date_of_birth : Date};