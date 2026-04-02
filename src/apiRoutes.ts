import { Router } from "express";
import userRoutes from "./features/auth/userRoutes";

const apiRoutes = Router();

apiRoutes.use("/auth", userRoutes)

export default apiRoutes