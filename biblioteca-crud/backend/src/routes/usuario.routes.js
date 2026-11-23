import { Router } from "express";

import {
    autenticarToken,
    autorizarAdmin,
} from "../middlewares/auth.middlewares.js";

import {
    listarUsuarios,
    buscarUsuarioPorId,
    cadastrarUsuario,
    atualizarUsuario,
    deletarUsuario,
} from "../controllers/usuario.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| PROTEÇÃO DAS ROTAS
|--------------------------------------------------------------------------
*/

// Primeiro verifica se o usuário está autenticado
router.use(autenticarToken);

// Depois verifica se ele é administrador
router.use(autorizarAdmin);

/*
|--------------------------------------------------------------------------
| ROTAS DE GERENCIAMENTO DE LEITORES
|--------------------------------------------------------------------------
*/

router.get("/", listarUsuarios);
router.get("/:id", buscarUsuarioPorId);
router.post("/", cadastrarUsuario);
router.put("/:id", atualizarUsuario);
router.delete("/:id", deletarUsuario);

export default router;