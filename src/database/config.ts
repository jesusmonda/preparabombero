import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";

const config = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: 'admin',
    database: 'preparabombero',
    entities: ["dist/database/entities/*.entity.js"],
    migrations: ["dist/database/migrations/*.js"],
    synchronize: true, // false on production
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);