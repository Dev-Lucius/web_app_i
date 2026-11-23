
import * as livroAutorService from "../services/livroAutor.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR ASSOCIAÇÕES
|--------------------------------------------------------------------------
| GET /api/livro-autores
*/
export async function listarLivroAutores(req, res) {
    console.log("GET /api/livro-autores: requisição recebida.");

    try {
        const associacoes = await livroAutorService.listarLivroAutoresService();

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
| GET /api/livro-autores/:livroId/:autorId
*/
export async function buscarLivroAutor(req, res) {
    console.log("GET /api/livro-autores/:livroId/:autorId: requisição recebida.");

    try {
        const livroId = Number(req.params.livroId);
        const autorId = Number(req.params.autorId);

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(autorId) || autorId <= 0
        ) {
            return res.status(400).json({
                erro: "Os IDs do livro e do autor devem ser válidos.",
            });
        }

        const associacao = await livroAutorService.buscarLivroAutorService(
            livroId,
            autorId
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
| ASSOCIAR AUTOR A LIVRO
|--------------------------------------------------------------------------
| POST /api/livro-autores
*/
export async function associarAutorAoLivro(req, res) {
    console.log("POST /api/livro-autores: requisição recebida.");

    try {
        const { livroId, autorId } = req.body;

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(autorId) || autorId <= 0
        ) {
            return res.status(400).json({
                erro: "Informe IDs válidos para o livro e o autor.",
            });
        }

        const associacao = await livroAutorService.associarAutorAoLivroService(
            livroId,
            autorId
        );

        return res.status(201).json(associacao);

    } catch (error) {
        console.error("Erro ao associar autor ao livro:", error);

        // Associação já existente
        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Este autor já está associado a este livro.",
            });
        }

        // Livro ou autor inexistente
        if (error.code === "P2003") {
            return res.status(404).json({
                erro: "Livro ou autor não encontrado.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível associar o autor ao livro.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| DESASSOCIAR AUTOR DE LIVRO
|--------------------------------------------------------------------------
| DELETE /api/livro-autores/:livroId/:autorId
*/
export async function desassociarAutorDoLivro(req, res) {
    console.log("DELETE /api/livro-autores/:livroId/:autorId: requisição recebida.");

    try {
        const livroId = Number(req.params.livroId);
        const autorId = Number(req.params.autorId);

        // Validando os IDs
        if (
            !Number.isInteger(livroId) || livroId <= 0 ||
            !Number.isInteger(autorId) || autorId <= 0
        ) {
            return res.status(400).json({
                erro: "Os IDs do livro e do autor devem ser válidos.",
            });
        }

        await livroAutorService.desassociarAutorDoLivroService(
            livroId,
            autorId
        );

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao desassociar autor do livro:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Associação não encontrada.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível desassociar o autor do livro.",
        });
    }
}
