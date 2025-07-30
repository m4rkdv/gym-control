import { envs } from "./config";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { MongoDatabase } from './infrastructure/database/mongo/connection';

    
    
    (()=>{
        main();
    })()

    async function main() {
        await MongoDatabase.connect();

        const routes = new AppRoutes();
        new Server({
            port:envs.PORT,
            routes:routes.routes,
        })
            .start()    
    }