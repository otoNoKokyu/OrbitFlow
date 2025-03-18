import { TEntityUser } from "src/utility/utility.type";

export type EditTEntityUser = Pick<TEntityUser, 'email'|'phone_number'|'username'|'address'|'city'|'profile_picture_url'>;
export type CredentialInfo = Pick<TEntityUser, 'password_hash' | 'email' | 'phone_number'>;
export type PersonalInfo = Omit<EditTEntityUser, 'email'| 'phone_number' | 'username'> ;