import { Router } from 'express';
const userRouter = Router();

userRouter.post('/', (req, res) => {
  return res.json({ ok: true })
});





export default userRouter;