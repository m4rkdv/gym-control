import { envs } from '../../config/envs.js';
import jwt, { SignOptions } from 'jsonwebtoken';

export class JwtService {

    static generateToken(
        payload: any,
        duration: string = '2h'): Promise<string | null> {
        return new Promise((resolve) => {
            const options: SignOptions = {
                expiresIn: duration,
            }as SignOptions;

            jwt.sign(
                payload,
                envs.JWT_SECRET,
                options,
                (err, token) => {
                    if (err) return resolve(null);
                    resolve(token!);
                });
        });
    }

    static validateToken<T>(token: string): Promise<T | null> {
        return new Promise((resolve) => {
            jwt.verify(token, envs.JWT_SECRET, (err, decoded) => {
                if (err) return resolve(null);
                resolve(decoded as T);
            });
        });
    }
}