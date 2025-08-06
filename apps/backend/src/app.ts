import { envs } from "./config";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { MongoDatabase } from './infrastructure/database/mongo/connection';
import { createDependencies } from "./presentation/dependencies";

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