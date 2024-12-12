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