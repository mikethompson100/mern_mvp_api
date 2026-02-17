"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserModel_1 = __importDefault(require("./UserModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRouter = (0, express_1.Router)();
userRouter.get("/getusers", async (req, res) => {
    try {
        const users = await UserModel_1.default.find(); // get all documents
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving users" });
    }
});
userRouter.post('/', async (req, res) => {
    const hashed = bcryptjs_1.default.hashSync(req.body.password, 10);
    const user = await UserModel_1.default.create({ username: req.body.username, password: hashed });
    return res.json({ ok: true });
});
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map