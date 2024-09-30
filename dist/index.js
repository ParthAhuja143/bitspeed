"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const Contact_1 = require("./entities/Contact");
const ContactService_1 = require("./services/ContactService");
const ContactController_1 = require("./controllers/ContactController");
const ContactRoutes_1 = require("./routes/ContactRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [Contact_1.Contact],
    synchronize: true,
    logging: false,
});
function initializeApp() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.AppDataSource.initialize();
            const contactRepository = exports.AppDataSource.getRepository(Contact_1.Contact);
            const contactService = new ContactService_1.ContactService(contactRepository);
            const contactController = new ContactController_1.ContactController(contactService);
            app.use("/api", (0, ContactRoutes_1.setupContactRoutes)(contactController));
            app.listen(process.env.PORT || 3000, () => {
                console.log(`Server is running on port ${process.env.PORT || 3000}`);
            });
        }
        catch (error) {
            console.log("Error during Data Source initialization", error);
        }
    });
}
initializeApp();
