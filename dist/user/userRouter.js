"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserModel_1 = __importDefault(require("./UserModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRouter = (0, express_1.Router)();
userRouter.post('/', async (req, res) => {
    const hashed = bcryptjs_1.default.hashSync(req.body.password, 10);
    const user = await UserModel_1.default.create({ username: req.body.username, password: hashed });
    return res.json({ user });
});
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map