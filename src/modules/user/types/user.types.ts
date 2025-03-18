import { EntityAttributes } from "src/common/interface/IBase";
import { TEntityUser } from "src/utility/utility.type";
import { User } from "../model/User.model";

export type EditTEntityUser = Partial<EntityAttributes<User>>;
export type CredentialInfo = Pick<EntityAttributes<User>, 'password_hash' | 'email' | 'phone_number'>;
export type PersonalInfo = Omit<EntityAttributes<User>, 'email'| 'phone_number' | 'username'> ;