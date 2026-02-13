"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
userRouter.post('/', (req, res) => {
    return res.json({ ok: true });
});
exports.default = userRouter;
//# sourceMappingURL=userRouter.js.map