import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { Dependencies } from '../dependencies.js';


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