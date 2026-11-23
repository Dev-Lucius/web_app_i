import "dotenv/config";
import express from "express";
import cors from "cors";
import livrosRoutes from "./routes/livros.routes.js";
import autoresRoutes from "./routes/autores.routes.js";
import categoriasRoutes from "./routes/categoria.routes.js";
import livroAutorRoutes from "./routes/livroAutor.routes.js";
import livroCategoriaRoutes from "./routes/livroCategoria.routes.js";
import usuariosRoutes from "./routes/usuario.routes.js";
import emprestimosRoutes from "./routes/emprestimo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();


app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        mensagem: "Biblioteca API funcionando!",
    });
});

app.use("/api/livros", livrosRoutes);
app.use("/api/autores", autoresRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/livro-autores", livroAutorRoutes);
app.use("/api/livro-categorias", livroCategoriaRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/emprestimos", emprestimosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
