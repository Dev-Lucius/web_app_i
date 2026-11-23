import { autenticarToken } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
    listarAutores,
    listarAutorPeloId,
    cadastrarAutor,
    atualizarAutor,
    deletarAutor
} from "../controllers/autores.controller.js";

const router = Router();
router.use(autenticarToken);

router.get("/", listarAutores);
router.get("/:id", listarAutorPeloId);
router.post("/", cadastrarAutor);
router.put("/:id", atualizarAutor);
router.delete("/:id", deletarAutor);

export default router;
