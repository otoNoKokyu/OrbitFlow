import { TEntityUser } from "src/utility/utility.type";

export type EditTEntityUser = Omit<TEntityUser, 'password_hash'>;
export type CredentialInfo = Pick<TEntityUser, 'password_hash' | 'email' | 'phone_number'>;
export type PersonalInfo = Omit<EditTEntityUser, 'email'| 'phone_number' | 'username'> ;