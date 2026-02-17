"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRouter_1 = __importDefault(require("./user/userRouter"));
dotenv_1.default.config();
if (!process.env.DB_URL) {
    throw new Error("DB_URL is not defined in the environment variables.");
}
if (!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables.");
}
mongoose_1.default.connect(process.env.DB_URL);
const app = (0, express_1.default)();
const corsMiddleware = (0, cors_1.default)();
app.use(corsMiddleware);
app.use(express_1.default.json());
app.use('/users', userRouter_1.default);
app.use("/getusers", userRouter_1.default);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
//# sourceMappingURL=api.js.map