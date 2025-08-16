import { envs } from "./config/index.js";
import { AppRoutes } from "./presentation/routes.js";
import { Server } from "./presentation/server.js";
import { MongoDatabase } from './infrastructure/database/mongo/connection.js';
import { createDependencies } from "./presentation/dependencies.js";

(async () => {
    await main();
})()

async function main() {
    await MongoDatabase.connect({
        mongoUrl: envs.MONGO_URL
    });

    const dependencies = createDependencies();
    const routes = new AppRoutes(dependencies);

    new Server({
        port: envs.PORT,
        routes: routes.routes,
    })
    .start()
}