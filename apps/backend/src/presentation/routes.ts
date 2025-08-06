import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { Dependencies } from "./dependencies";

export class AppRoutes {
    constructor(private readonly dependencies: Dependencies) { }

    get routes(): Router {
        const appRouter = Router();
        const authRouter = new AuthRoutes(this.dependencies);

        appRouter.use('/api/auth', authRouter.routes)

        return appRouter;
    }
}