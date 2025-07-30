import { envs } from "./config";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";

    
    
    (()=>{
        main();
    })()

    async function main() {
        const routes = new AppRoutes();
        new Server({
            port:envs.PORT,
            routes:routes.routes,
        })
            .start()    
    }