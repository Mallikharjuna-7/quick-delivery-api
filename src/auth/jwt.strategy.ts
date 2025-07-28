import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'access_secret',
            ignoreExpiration: false,
        });
    }

    async validate(payload: any){
        console.log('JWT payload:',payload);
        return {userId: payload.sub, email: payload.email,role:payload.role};
    }
}