import { Router } from "express";
import { autenticarToken } from "../middlewares/auth.middlewares.js";

import {
    listarCategorias,
    listarCategoriaPeloId,
    cadastrarCategoria,
    atualizarCategoria,
    deletarCategoria
} from "../controllers/categoria.controller.js";

const router = Router();
router.use(autenticarToken);

router.get("/", listarCategorias);
router.get("/:id", listarCategoriaPeloId);
router.post("/", cadastrarCategoria);
router.put("/:id", atualizarCategoria);
router.delete("/:id", deletarCategoria);

export default router;
