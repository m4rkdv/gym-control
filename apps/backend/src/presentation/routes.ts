import { Router } from "express";
import { AuthRoutes } from "./auth/routes.js";
import { Dependencies } from "./dependencies.js";
import { MembersRoutes } from "./member/routes.js";
import { HealthRoutes } from "./health/routes.js";

export class AppRoutes {
    constructor(private readonly dependencies: Dependencies) { }

    get routes(): Router {
        const appRouter = Router();
        const authRouter = new AuthRoutes(this.dependencies);
        const membersRouter = new MembersRoutes({
            memberRepository: this.dependencies.memberRepository,
            userRepository: this.dependencies.userRepository,
            paymentRepository: this.dependencies.paymentRepository,
            systemConfigRepository: this.dependencies.systemConfigRepository
        });

        const healthRouter = new HealthRoutes();

        // Health check 
        appRouter.use('/api', healthRouter.routes);

        appRouter.use('/api/auth', authRouter.routes);
        appRouter.use('/api/members', membersRouter.routes);

        return appRouter;
    }
}