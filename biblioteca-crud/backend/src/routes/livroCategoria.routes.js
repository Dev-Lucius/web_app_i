import { Router } from "express";
import { autenticarToken } from "../middlewares/auth.middlewares.js";

import {
    listarLivroCategorias,
    buscarLivroCategoria,
    associarCategoriaAoLivro,
    desassociarCategoriaDoLivro,
} from "../controllers/livroCategoria.controller.js";

const router = Router();
router.use(autenticarToken);

router.get("/", listarLivroCategorias);
router.get("/:livroId/:categoriaId", buscarLivroCategoria);
router.post("/", associarCategoriaAoLivro);
router.delete("/:livroId/:categoriaId", desassociarCategoriaDoLivro);

export default router;
