"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupContactRoutes = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const setupContactRoutes = (contactController) => {
    router.post('/identify', contactController.identify);
    return router;
};
exports.setupContactRoutes = setupContactRoutes;
exports.default = exports.setupContactRoutes;
