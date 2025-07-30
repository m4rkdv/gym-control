import { Router } from "express";
import { AuthRoutes } from "./auth/routes";

export class AppRoutes {


    get routes():Router{

        const appRouter = Router();
        const authRouter = new AuthRoutes;
        
        appRouter.use('/api/auth', authRouter.routes)

        return appRouter;
    }
}