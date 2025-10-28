import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Event } from "./entities/event.entity";
import { Workspace } from "./entities/workspace.entity";
import * as dotenv from "dotenv";
import { Message } from "./entities/message.entity";
import { Session } from "./entities/session.entity";

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: false,
  //logging logs sql command on the treminal
  logging: false,
  entities: [User, Event, Workspace, Message, Session],
  migrations: [__dirname + "/database/migrations/*.ts"],
  subscribers: [],
});
