import { Router } from "express";
import { AuthRoutes } from "./auth/routes";

export class AppRoutes {


    get routes():Router{

        const router = Router();
        const auth = new AuthRoutes;
        router.use('/api/auth', auth.routes)

        return router;
    }
}