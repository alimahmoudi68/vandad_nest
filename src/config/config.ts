import {registerAs} from "@nestjs/config";

export enum configKeys {
    APP = "App" ,
    JWT = "Jwt" ,
    SMS = "Sms"
}

const AppConfig =  registerAs(configKeys.APP , ()=>({
    port : process.env.PORT ,
}));

const JwtConfig =  registerAs(configKeys.JWT , ()=>({
    accessTokenSecret : process.env.ACCESS_TOKEN_SECRET ,
    refreshTokenSecret : process.env.REFRESH_TOKEN_SECRET ,
}));


const SmsConfig =  registerAs(configKeys.SMS , ()=>({
    username : process.env.SMS_USERNAME ,
    password : process.env.SMS_PASSWORD ,
    loginPattern : process.env.SMS_LOGIN_PATTERN ,
}));

export const configuration = [AppConfig , JwtConfig , SmsConfig];