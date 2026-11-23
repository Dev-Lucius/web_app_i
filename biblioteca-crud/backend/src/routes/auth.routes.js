
import { Router } from "express";

import {
    login,
    buscarUsuarioAutenticado,
} from "../controllers/auth.controller.js";

import {
    autenticarToken,
} from "../middlewares/auth.middlewares.js";

const router = Router();

// Realizar login
router.post("/login", login);

// Consultar usuário autenticado
router.get(
    "/me",
    autenticarToken,
    buscarUsuarioAutenticado
);

export default router;
