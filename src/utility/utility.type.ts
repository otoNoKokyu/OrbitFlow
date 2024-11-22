export enum JwtEncodables {
    ACCESS_TOKEN =  'JWT_SECRET',
    REFRESH_TOKEN = 'JWT_REFRESH_SECRET',
    INVITE = 'JWT_INVITE_SECRET'
}
export enum JwtEncodableExpiry{
    ACCESS_TOKEN =  '1h',
    REFRESH_TOKEN = '7d',
    INVITE = 60
}