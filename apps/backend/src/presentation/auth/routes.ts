import { Router } from 'express';
import { AuthController } from './controller';
import { Dependencies } from '../dependencies';


export class AuthRoutes {
    constructor(private readonly dependencies: Dependencies) { }

    get routes(): Router {

        const router = Router();
        const controller = new AuthController(
            this.dependencies.userRepository,
            this.dependencies.memberRepository
        );

        router.post('/login', controller.loginUser)
        router.post('/register', controller.registerUser)

        return router;
    }
}