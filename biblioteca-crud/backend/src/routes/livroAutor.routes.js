import { autenticarToken } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

import {
    listarLivroAutores,
    buscarLivroAutor,
    associarAutorAoLivro,
    desassociarAutorDoLivro,
} from "../controllers/livroAutor.controller.js";

const router = Router();
router.use(autenticarToken);


router.get("/", listarLivroAutores);
router.get("/:livroId/:autorId", buscarLivroAutor);
router.post("/", associarAutorAoLivro);
router.delete("/:livroId/:autorId", desassociarAutorDoLivro);

export default router;
