import { Router } from "express";
import { cadastrarLivros, listarLivros, listarLivroPeloId, atualizarLivro, deletarLivro } from "../controllers/livros.controller.js";
import { autenticarToken } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(autenticarToken);

router.get("/", listarLivros);
router.get("/:id", listarLivroPeloId);
router.post("/", cadastrarLivros);
router.put("/:id", atualizarLivro);
router.delete("/:id", deletarLivro);

export default router;
