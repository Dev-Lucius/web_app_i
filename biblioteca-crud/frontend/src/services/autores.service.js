
import api from "./api";

/*
|--------------------------------------------------------------------------
| LISTAR AUTORES
|--------------------------------------------------------------------------
| Busca todos os autores cadastrados.
|--------------------------------------------------------------------------
*/

export async function listarAutores() {
    const resposta = await api.get("/autores");

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| BUSCAR AUTOR POR ID
|--------------------------------------------------------------------------
| Busca um autor específico, incluindo seus relacionamentos.
|--------------------------------------------------------------------------
*/

export async function buscarAutorPorId(id) {
    const resposta = await api.get(`/autores/${id}`);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| CADASTRAR AUTOR
|--------------------------------------------------------------------------
| Envia os dados de um novo autor para a API.
|--------------------------------------------------------------------------
*/

export async function cadastrarAutor(dados) {
    const resposta = await api.post("/autores", dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR AUTOR
|--------------------------------------------------------------------------
| Atualiza os dados de um autor existente.
|--------------------------------------------------------------------------
*/

export async function atualizarAutor(id, dados) {
    const resposta = await api.put(`/autores/${id}`, dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| DELETAR AUTOR
|--------------------------------------------------------------------------
| Solicita a exclusão de um autor pelo seu ID.
|--------------------------------------------------------------------------
*/

export async function deletarAutor(id) {
    const resposta = await api.delete(`/autores/${id}`);

    return resposta.data;
}
