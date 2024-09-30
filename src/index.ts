import "reflect-metadata";
import { DataSource } from "typeorm";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Contact } from "./entities/Contact";
import { ContactService } from "./services/ContactService";
import { ContactController } from "./controllers/ContactController";
import { setupContactRoutes } from "./routes/ContactRoutes";

dotenv.config();

const app = express();
app.use(bodyParser.json());

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [Contact],
  synchronize: true,
  logging: false,
});

async function initializeApp() {
  try {
    await AppDataSource.initialize();
    
    const contactRepository = AppDataSource.getRepository(Contact);

    const contactService = new ContactService(contactRepository);
    const contactController = new ContactController(contactService);

    app.use("/api", setupContactRoutes(contactController));

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.log("Error during Data Source initialization", error);
  }
}

initializeApp();