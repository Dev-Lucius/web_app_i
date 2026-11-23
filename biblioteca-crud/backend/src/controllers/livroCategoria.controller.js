
import * as livroCategoriaService from "../services/livroCategoria.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR ASSOCIAÇÕES
|--------------------------------------------------------------------------
| GET /api/livro-categorias
*/
export async function listarLivroCategorias(req, res) {
    console.log("GET /api/livro-categorias: requisição recebida.");

    try {
        const associacoes = await livroCategoriaService.listarLivroCategoriasService();

        return res.status(200).json(associacoes);

    } catch (error) {
        console.error("Erro ao listar associações:", error);

        return res.status(500).json({
            erro: "Não foi possível listar as associações.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR ASSOCIAÇÃO
|--------------------------------------------------------------------------
| GET /api/livro-categorias/:livroId/:categoriaId
*/
export async function buscarLivroCategoria(req, res) {
    console.log("GET /api/livro-categorias/:livroId/:categoriaId: requisição recebida.");

    try {
        const livroId = Number(req.params.livroId);
        const categoriaId = Number(req.params.categoriaId);

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(categoriaId) || categoriaId <= 0
        ) {
            return res.status(400).json({
                erro: "Os IDs do livro e da categoria devem ser válidos.",
            });
        }

        const associacao = await livroCategoriaService.buscarLivroCategoriaService(
            livroId,
            categoriaId
        );

        if (!associacao) {
            return res.status(404).json({
                erro: "Associação não encontrada.",
            });
        }

        return res.status(200).json(associacao);

    } catch (error) {
        console.error("Erro ao buscar associação:", error);

        return res.status(500).json({
            erro: "Não foi possível buscar a associação.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| ASSOCIAR CATEGORIA A LIVRO
|--------------------------------------------------------------------------
| POST /api/livro-categorias
*/
export async function associarCategoriaAoLivro(req, res) {
    console.log("POST /api/livro-categorias: requisição recebida.");

    try {
        const { livroId, categoriaId } = req.body ?? {};

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(categoriaId) || categoriaId <= 0
        ) {
            return res.status(400).json({
                erro: "Informe IDs válidos para o livro e a categoria.",
            });
        }

        const associacao = await livroCategoriaService.associarCategoriaAoLivroService(
            livroId,
            categoriaId
        );

        return res.status(201).json(associacao);

    } catch (error) {
        console.error("Erro ao associar categoria ao livro:", error);

        // Associação já existente
        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Esta categoria já está associada a este livro.",
            });
        }

        // Livro ou categoria inexistente
        if (error.code === "P2003") {
            return res.status(404).json({
                erro: "Livro ou categoria não encontrado.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível associar a categoria ao livro.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| DESASSOCIAR CATEGORIA DE LIVRO
|--------------------------------------------------------------------------
| DELETE /api/livro-categorias/:livroId/:categoriaId
*/
export async function desassociarCategoriaDoLivro(req, res) {
    console.log("DELETE /api/livro-categorias/:livroId/:categoriaId: requisição recebida.");

    try {
        const livroId = Number(req.params.livroId);
        const categoriaId = Number(req.params.categoriaId);

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(categoriaId) || categoriaId <= 0
        ) {
            return res.status(400).json({
                erro: "Os IDs do livro e da categoria devem ser válidos.",
            });
        }

        await livroCategoriaService.desassociarCategoriaDoLivroService(
            livroId,
            categoriaId
        );

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao desassociar categoria do livro:", error);

        // Associação não encontrada
        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Associação não encontrada.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível desassociar a categoria do livro.",
        });
    }
}
