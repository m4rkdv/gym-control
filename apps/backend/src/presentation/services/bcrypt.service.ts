import bcryptjs from 'bcryptjs';

export class BcryptService {
    static hash(password: string): string {
        return bcryptjs.hashSync(password, 10);
    }

    static compare(password: string, hashed: string): boolean {
        return bcryptjs.compareSync(password, hashed);
    }
}