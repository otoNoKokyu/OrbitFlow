export type TSignIn = {
    email: string;
    password: string
}
export type TSendOtp = {
    resend: boolean;
    email: string;
}
export type TInvite = {
    email:string
    roleId: string,
    pId: string,
    
}
export type TVerify = {
    eamil:string;
    otp: number;
}
export type TForgetPassword = {
    token:string;
    password: string;
    confirmPassword: string;
}
