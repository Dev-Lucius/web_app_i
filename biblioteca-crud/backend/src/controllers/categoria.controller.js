
import * as categoriasService from "../services/categoria.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR CATEGORIAS
|--------------------------------------------------------------------------
| GET /api/categorias
*/
export async function listarCategorias(req, res) {
    console.log("GET /api/categorias: requisição recebida.");

    try {
        const categorias = await categoriasService.listarCategoriasService();

        return res.status(200).json(categorias);

    } catch (error) {
        console.error("Erro ao listar categorias:", error);

        return res.status(500).json({
            erro: "Não foi possível listar as categorias.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR CATEGORIA POR ID
|--------------------------------------------------------------------------
| GET /api/categorias/:id
*/
export async function listarCategoriaPeloId(req, res) {
    console.log("GET /api/categorias/:id: requisição recebida.");

    try {
        const idCategoria = Number(req.params.id);

        // Validando o ID
        if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const categoria = await categoriasService.buscarCategoriaPorIdService(idCategoria);

        if (!categoria) {
            return res.status(404).json({
                erro: "Categoria não encontrada.",
            });
        }

        return res.status(200).json(categoria);

    } catch (error) {
        console.error("Erro ao buscar categoria:", error);

        return res.status(500).json({
            erro: "Não foi possível buscar a categoria.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| CADASTRAR CATEGORIA
|--------------------------------------------------------------------------
| POST /api/categorias
*/
export async function cadastrarCategoria(req, res) {
    console.log("POST /api/categorias: requisição recebida.");

    try {
        const { nome, descricao } = req.body;

        // Validando o nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                erro: "O nome da categoria é obrigatório.",
            });
        }

        // Validando a descrição
        if (
            descricao !== undefined &&
            descricao !== null &&
            typeof descricao !== "string"
        ) {
            return res.status(400).json({
                erro: "A descrição deve ser um texto válido.",
            });
        }

        const novaCategoria = await categoriasService.cadastrarCategoriaService({
            nome,
            descricao,
        });

        return res.status(201).json(novaCategoria);

    } catch (error) {
        console.error("Erro ao cadastrar categoria:", error);

        // Nome de categoria já cadastrado
        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Já existe uma categoria com esse nome.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível cadastrar a categoria.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR CATEGORIA
|--------------------------------------------------------------------------
| PUT /api/categorias/:id
*/
export async function atualizarCategoria(req, res) {
    console.log("PUT /api/categorias/:id: requisição recebida.");

    try {
        const idCategoria = Number(req.params.id);

        // Validando o ID
        if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const { nome, descricao } = req.body;

        // Validando o nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                erro: "O nome da categoria é obrigatório.",
            });
        }

        // Validando a descrição
        if (
            descricao !== undefined &&
            descricao !== null &&
            typeof descricao !== "string"
        ) {
            return res.status(400).json({
                erro: "A descrição deve ser um texto válido.",
            });
        }

        const categoriaAtualizada = await categoriasService.atualizarCategoriaService(
            idCategoria,
            {
                nome,
                descricao,
            }
        );

        return res.status(200).json(categoriaAtualizada);

    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Categoria não encontrada.",
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Já existe uma categoria com esse nome.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível atualizar a categoria.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| DELETAR CATEGORIA
|--------------------------------------------------------------------------
| DELETE /api/categorias/:id
*/
export async function deletarCategoria(req, res) {
    console.log("DELETE /api/categorias/:id: requisição recebida.");

    try {
        const idCategoria = Number(req.params.id);

        // Validando o ID
        if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const categoriaDeletada = await categoriasService.deletarCategoriaService(idCategoria);

        console.log(`Categoria deletada com sucesso: ${categoriaDeletada.id}`);

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao deletar categoria:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Categoria não encontrada.",
            });
        }

        if (error.code === "P2003") {
            return res.status(409).json({
                erro: "Não é possível excluir esta categoria porque existem livros associados.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível deletar a categoria.",
        });
    }
}
