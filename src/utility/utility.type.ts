export enum JwtEncodables {
    ACCESS_TOKEN =  'JWT_SECRET',
    REFRESH_TOKEN = 'JWT_REFRESH_SECRET',
    INVITE = 'JWT_INVITE_SECRET'
}
export enum JwtEncodableExpiry{
    arko =  '1d',
    cholbe = '7d',
    hello = '1d'
}
export type TAppUser = {
    userId:string;
    role:string;
    username: string;
    roleId:string
}
export type TEntityUser = {
    user_id: string;
    username: string;
    password_hash: string;
    email: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: Date;
    gender?: 'Male' | 'Female' | 'Other';
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    profile_picture_url?: string;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    is_active: boolean;
    access_token?: string;
    refresh_token?: string;
    roleId?: string;
    isInvited: boolean;
    invited_by?: string;
  };
  