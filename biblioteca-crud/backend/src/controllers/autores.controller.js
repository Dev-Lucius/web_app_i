
import * as autoresService from "../services/autores.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR AUTORES
|--------------------------------------------------------------------------
| GET /api/autores
*/
export async function listarAutores(req, res) {
    console.log("GET /api/autores: requisição recebida.");

    try {
        const autores = await autoresService.listarAutoresService();

        return res.status(200).json(autores);

    } catch (error) {
        console.error("Erro ao listar autores:", error);

        return res.status(500).json({
            erro: "Não foi possível listar os autores.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR AUTOR POR ID
|--------------------------------------------------------------------------
| GET /api/autores/:id
*/
export async function listarAutorPeloId(req, res) {
    console.log("GET /api/autores/:id: requisição recebida.");

    try {
        const idAutor = Number(req.params.id);

        if (!Number.isInteger(idAutor) || idAutor <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const autor = await autoresService.buscarAutorPorIdService(idAutor);

        if (!autor) {
            return res.status(404).json({
                erro: "Autor não encontrado.",
            });
        }

        return res.status(200).json(autor);

    } catch (error) {
        console.error("Erro ao buscar autor:", error);

        return res.status(500).json({
            erro: "Não foi possível buscar o autor.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| CADASTRAR AUTOR
|--------------------------------------------------------------------------
| POST /api/autores
*/
export async function cadastrarAutor(req, res) {
    console.log("POST /api/autores: requisição recebida.");

    try {
        const { nome, biografia } = req.body;

        // Validando o nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                erro: "O nome do autor é obrigatório.",
            });
        }

        // Validando a biografia
        if (biografia !== undefined && biografia !== null && typeof biografia !== "string") {
            return res.status(400).json({
                erro: "A biografia deve ser um texto válido.",
            });
        }

        const novoAutor = await autoresService.cadastrarAutorService({
            nome,
            biografia,
        });

        return res.status(201).json(novoAutor);

    } catch (error) {
        console.error("Erro ao cadastrar autor:", error);

        return res.status(500).json({
            erro: "Não foi possível cadastrar o autor.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR AUTOR
|--------------------------------------------------------------------------
| PUT /api/autores/:id
*/
export async function atualizarAutor(req, res) {
    console.log("PUT /api/autores/:id: requisição recebida.");

    try {
        const idAutor = Number(req.params.id);

        if (!Number.isInteger(idAutor) || idAutor <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const { nome, biografia } = req.body;

        // Validando o nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                erro: "O nome do autor é obrigatório.",
            });
        }

        // Validando a biografia
        if (biografia !== undefined && biografia !== null && typeof biografia !== "string") {
            return res.status(400).json({
                erro: "A biografia deve ser um texto válido.",
            });
        }

        const autorAtualizado = await autoresService.atualizarAutorService(
            idAutor,
            {
                nome,
                biografia,
            }
        );

        return res.status(200).json(autorAtualizado);

    } catch (error) {
        console.error("Erro ao atualizar autor:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Autor não encontrado.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível atualizar o autor.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| DELETAR AUTOR
|--------------------------------------------------------------------------
| DELETE /api/autores/:id
*/

export async function deletarAutor(req, res) {
    console.log("DELETE /api/autores/:id: requisição recebida.");

    try {
        const idAutor = Number(req.params.id);

        // Validar identificador
        if (!Number.isInteger(idAutor) || idAutor <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const autorDeletado =
            await autoresService.deletarAutorService(idAutor);

        // Verificar se o autor existe
        if (!autorDeletado) {
            return res.status(404).json({
                erro: "Autor não encontrado.",
            });
        }

        console.log(`Autor deletado com sucesso: ${autorDeletado.id}`);

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao deletar autor:", error);

        // Autor possui livros associados
        if (error.message === "AUTOR_POSSUI_LIVROS") {
            return res.status(409).json({
                erro: "Não é possível excluir este autor porque existem livros associados.",
            });
        }

        // Registro inexistente
        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Autor não encontrado.",
            });
        }

        // Violação de chave estrangeira
        if (error.code === "P2003") {
            return res.status(409).json({
                erro: "Não é possível excluir este autor porque existem relacionamentos associados.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível deletar o autor.",
        });
    }
}

