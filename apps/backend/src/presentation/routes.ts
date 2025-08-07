import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { Dependencies } from "./dependencies";
import { MembersRoutes } from "./member/routes";

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

        appRouter.use('/api/auth', authRouter.routes);
        appRouter.use('/api/members', membersRouter.routes);

        return appRouter;
    }
}