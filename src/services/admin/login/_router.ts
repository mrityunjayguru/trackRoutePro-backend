import { Router } from "express";
import { login, signup,forgotPassword,resetPassword } from "./login";
const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot_password',forgotPassword );
router.post('/reset_password', resetPassword);

export default router;