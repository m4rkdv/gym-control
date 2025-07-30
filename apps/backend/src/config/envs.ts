import 'dotenv/config'
import env from 'env-var'

export const envs = {
    PORT: env.get('PORT').required().asPortNumber(),
    JWT_SECRET: env.get('JWT_SECRET').required().asString(),
    MONGO_URL: env.get('MONGO_URL').required().asString(),
}