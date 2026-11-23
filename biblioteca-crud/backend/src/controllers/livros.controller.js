
import * as livrosService from "../services/livros.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR Autores
|--------------------------------------------------------------------------
| GET /api/livros
*/
export async function listarLivros(req, res) {
    console.log("GET /api/livros: requisição recebida.");

    try {
        const livros = await livrosService.listarLivrosService();

        return res.status(200).json(livros);

    } catch (error) {
        console.error("Erro ao listar livros:", error);

        return res.status(500).json({
            erro: "Não foi possível listar os livros.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR LIVRO POR ID
|--------------------------------------------------------------------------
| GET /api/livros/:id
*/
export async function listarLivroPeloId(req, res) {
    console.log("GET /api/livros/:id: requisição recebida.");

    try {
        const idLivro = Number(req.params.id);

        if (!Number.isInteger(idLivro) || idLivro <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const livro = await livrosService.buscarLivroPorIdService(idLivro);

        if (!livro) {
            return res.status(404).json({
                erro: "Livro não encontrado.",
            });
        }

        // console.log("Resultado da busca por ID:", JSON.stringify(livro, null, 2));
        return res.status(200).json(livro);

    } catch (error) {
        console.error("Erro ao buscar livro:", error);

        return res.status(500).json({
            erro: "Não foi possível buscar o livro.",
        });
    }
}


/*
|--------------------------------------------------------------------------
| CADASTRAR LIVRO
|--------------------------------------------------------------------------
| POST /api/livros
*/
export async function cadastrarLivros(req, res) {
    console.log("POST /api/livros: requisição recebida.");

    try {
        const {
            titulo,
            isbn,
            anoPublicacao,
            disponivel,
            autorIds = [],
            categoriaIds = [],
        } = req.body;

        // 1. Validar o título
        if (typeof titulo !== "string" || !titulo.trim()) {
            return res.status(400).json({
                erro: "O título do livro é obrigatório.",
            });
        }

        // 2. Validar o ISBN
        if (
            isbn !== undefined &&
            isbn !== null &&
            typeof isbn !== "string"
        ) {
            return res.status(400).json({
                erro: "O ISBN deve ser um texto válido.",
            });
        }

        // ISBN vazio será armazenado como NULL
        const isbnNormalizado = isbn?.trim() || null;

        // 3. Validar o ano de publicação
        let ano = null;

        if (
            anoPublicacao !== undefined &&
            anoPublicacao !== null &&
            anoPublicacao !== ""
        ) {
            ano = Number(anoPublicacao);

            if (!Number.isInteger(ano) || ano < 0) {
                return res.status(400).json({
                    erro: "O ano de publicação deve ser um número inteiro válido.",
                });
            }
        }

        // 4. Validar disponibilidade
        const disponibilidade = disponivel ?? true;

        if (typeof disponibilidade !== "boolean") {
            return res.status(400).json({
                erro: "A disponibilidade deve ser verdadeira ou falsa.",
            });
        }

        // 5. Validar os IDs dos autores
        if (!Array.isArray(autorIds)) {
            return res.status(400).json({
                erro: "Os autores devem ser enviados em uma lista.",
            });
        }

        const autores = [...new Set(autorIds.map(Number))];

        if (autores.some(id => !Number.isInteger(id) || id <= 0)) {
            return res.status(400).json({
                erro: "Um ou mais IDs de autores são inválidos.",
            });
        }

        // 6. Validar os IDs das categorias
        if (!Array.isArray(categoriaIds)) {
            return res.status(400).json({
                erro: "As categorias devem ser enviadas em uma lista.",
            });
        }

        const categorias = [...new Set(categoriaIds.map(Number))];

        if (categorias.some(id => !Number.isInteger(id) || id <= 0)) {
            return res.status(400).json({
                erro: "Um ou mais IDs de categorias são inválidos.",
            });
        }

        // 7. Cadastrar livro e relacionamentos
        const novoLivro = await livrosService.cadastrarLivroService({
            titulo: titulo.trim(),
            isbn: isbnNormalizado,
            anoPublicacao: ano,
            disponivel: disponibilidade,
            autorIds: autores,
            categoriaIds: categorias,
        });

        return res.status(201).json(novoLivro);

    } catch (error) {
        console.error("Erro ao cadastrar livro:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Já existe um livro com esse ISBN.",
            });
        }

        if (error.code === "P2025") {
            return res.status(400).json({
                erro: "Um ou mais autores ou categorias informados não existem.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível cadastrar o livro.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR LIVRO
|--------------------------------------------------------------------------
| PUT /api/livros/:id
*/
export async function atualizarLivro(req, res) {
    console.log("PUT /api/livros/:id: requisição recebida.");

    try {
        const idLivro = Number(req.params.id);

        if (!Number.isInteger(idLivro) || idLivro <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const {
            titulo,
            isbn,
            anoPublicacao,
            disponivel,
            autorIds = [],
            categoriaIds = [],
        } = req.body;

        // 1. Validar título
        if (typeof titulo !== "string" || !titulo.trim()) {
            return res.status(400).json({
                erro: "O título do livro é obrigatório.",
            });
        }

        // 2. Validar ISBN
        if (
            isbn !== undefined &&
            isbn !== null &&
            typeof isbn !== "string"
        ) {
            return res.status(400).json({
                erro: "O ISBN deve ser um texto válido.",
            });
        }

        const isbnNormalizado = isbn?.trim() || null;

        // 3. Validar ano de publicação
        let ano = null;

        if (
            anoPublicacao !== undefined &&
            anoPublicacao !== null &&
            anoPublicacao !== ""
        ) {
            ano = Number(anoPublicacao);

            if (!Number.isInteger(ano) || ano < 0) {
                return res.status(400).json({
                    erro: "O ano de publicação deve ser um número inteiro válido.",
                });
            }
        }

        // 4. Validar disponibilidade
        if (typeof disponivel !== "boolean") {
            return res.status(400).json({
                erro: "A disponibilidade deve ser verdadeira ou falsa.",
            });
        }

        // 5. Validar autores
        if (!Array.isArray(autorIds)) {
            return res.status(400).json({
                erro: "Os autores devem ser enviados em uma lista.",
            });
        }

        const autores = [...new Set(autorIds.map(Number))];

        if (autores.some((id) => !Number.isInteger(id) || id <= 0)) {
            return res.status(400).json({
                erro: "Um ou mais IDs de autores são inválidos.",
            });
        }

        // 6. Validar categorias
        if (!Array.isArray(categoriaIds)) {
            return res.status(400).json({
                erro: "As categorias devem ser enviadas em uma lista.",
            });
        }

        const categorias = [...new Set(categoriaIds.map(Number))];

        if (categorias.some((id) => !Number.isInteger(id) || id <= 0)) {
            return res.status(400).json({
                erro: "Um ou mais IDs de categorias são inválidos.",
            });
        }

        // 7. Atualizar livro e relacionamentos
        const livroAtualizado = await livrosService.atualizarLivroService(
            idLivro,
            {
                titulo: titulo.trim(),
                isbn: isbnNormalizado,
                anoPublicacao: ano,
                disponivel,
                autorIds: autores,
                categoriaIds: categorias,
            }
        );

        return res.status(200).json(livroAtualizado);

    } catch (error) {
        console.error("Erro ao atualizar livro:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Livro, autor ou categoria não encontrado.",
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Já existe um livro com esse ISBN.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível atualizar o livro.",
        });
    }
}


/*
|--------------------------------------------------------------------------
| DELETAR LIVRO
|--------------------------------------------------------------------------
| DELETE /api/livros/:id
*/
export async function deletarLivro(req, res) {
    console.log("DELETE /api/livros/:id: requisição recebida.");

    try {
        const idLivro = Number(req.params.id);

        if (!Number.isInteger(idLivro) || idLivro <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const livroDeletado = await livrosService.deletarLivroService(idLivro);

        console.log(`Livro deletado com sucesso: ${livroDeletado.id}`);

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao deletar livro:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Livro não encontrado.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível deletar o livro.",
        });
    }
}
