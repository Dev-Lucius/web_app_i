
import api from "./api";

/*
|--------------------------------------------------------------------------
| LISTAR CATEGORIAS
|--------------------------------------------------------------------------
| GET /api/categorias
*/

export async function listarCategorias() {
    const resposta = await api.get("/categorias");

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| BUSCAR CATEGORIA POR ID
|--------------------------------------------------------------------------
| GET /api/categorias/:id
*/

export async function buscarCategoriaPorId(id) {
    const resposta = await api.get(`/categorias/${id}`);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| CADASTRAR CATEGORIA
|--------------------------------------------------------------------------
| POST /api/categorias
*/

export async function cadastrarCategoria(dados) {
    const resposta = await api.post("/categorias", dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR CATEGORIA
|--------------------------------------------------------------------------
| PUT /api/categorias/:id
*/

export async function atualizarCategoria(id, dados) {
    const resposta = await api.put(`/categorias/${id}`, dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| DELETAR CATEGORIA
|--------------------------------------------------------------------------
| DELETE /api/categorias/:id
*/

export async function deletarCategoria(id) {
    const resposta = await api.delete(`/categorias/${id}`);

    return resposta.data;
}
