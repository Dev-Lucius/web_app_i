import { autenticarToken } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
    listarEmprestimos,
    buscarEmprestimoPorId,
    listarEmprestimosPorUsuario,
    cadastrarEmprestimo,
    registrarDevolucao,
} from "../controllers/emprestimo.controller.js";

const router = Router();
router.use(autenticarToken);

router.get("/", listarEmprestimos);
router.get("/usuario/:usuarioId", listarEmprestimosPorUsuario);
router.get("/:id", buscarEmprestimoPorId);
router.post("/", cadastrarEmprestimo);
router.patch("/:id/devolucao", registrarDevolucao);

export default router;
