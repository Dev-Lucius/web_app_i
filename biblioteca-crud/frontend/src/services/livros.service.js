
import api from "./api";

/*
|--------------------------------------------------------------------------
| LISTAR LIVROS
|--------------------------------------------------------------------------
*/

export async function listarLivros() {
    const resposta = await api.get("/livros");

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| BUSCAR LIVRO POR ID
|--------------------------------------------------------------------------
*/

export async function buscarLivroPorId(id) {
    const resposta = await api.get(`/livros/${id}`);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| CADASTRAR LIVRO
|--------------------------------------------------------------------------
*/

export async function cadastrarLivro(dados) {
    const resposta = await api.post("/livros", dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR LIVRO
|--------------------------------------------------------------------------
*/

export async function atualizarLivro(id, dados) {
    const resposta = await api.put(`/livros/${id}`, dados);

    return resposta.data;
}

/*
|--------------------------------------------------------------------------
| EXCLUIR LIVRO
|--------------------------------------------------------------------------
*/

export async function deletarLivro(id) {
    const resposta = await api.delete(`/livros/${id}`);

    return resposta.data;
}
