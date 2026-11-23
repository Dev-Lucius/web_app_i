
import api from "./api";

/*
|--------------------------------------------------------------------------
| SERVIÇO DE USUÁRIOS
|--------------------------------------------------------------------------
|
| Centraliza as requisições HTTP relacionadas aos leitores.
|
| A instância api já configura:
|
| - URL base da API;
| - Content-Type;
| - Interceptor para envio automático do JWT.
|
|--------------------------------------------------------------------------
*/


// Listar todos os leitores
// GET /api/usuarios
export async function listarUsuarios() {

    const resposta = await api.get("/usuarios");

    return resposta.data;

}


// Buscar um leitor pelo ID
// GET /api/usuarios/:id
export async function buscarUsuarioPorId(id) {

    const resposta = await api.get(`/usuarios/${id}`);

    return resposta.data;

}


// Cadastrar um novo leitor
// POST /api/usuarios
export async function cadastrarUsuario(dados) {

    const resposta = await api.post("/usuarios", dados);

    return resposta.data;

}


// Atualizar os dados de um leitor
// PUT /api/usuarios/:id
export async function atualizarUsuario(id, dados) {

    const resposta = await api.put(`/usuarios/${id}`, dados);

    return resposta.data;

}


// Excluir um leitor
// DELETE /api/usuarios/:id
export async function deletarUsuario(id) {

    const resposta = await api.delete(`/usuarios/${id}`);

    return resposta.data;

}
