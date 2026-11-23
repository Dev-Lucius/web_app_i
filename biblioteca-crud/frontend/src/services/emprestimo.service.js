import api from "./api";

// Listar todos os empréstimos
export async function listarEmprestimos() {
    const resposta = await api.get("/emprestimos");
    return resposta.data;
}

// Buscar um empréstimo pelo ID
export async function buscarEmprestimoPorId(id) {
    const resposta = await api.get(`/emprestimos/${id}`);
    return resposta.data;
}

// Listar empréstimos de um usuário
export async function listarEmprestimosPorUsuario(usuarioId) {
    const resposta = await api.get(`/emprestimos/usuario/${usuarioId}`);
    return resposta.data;
}

// Cadastrar um novo empréstimo
export async function cadastrarEmprestimo(dados) {
    const resposta = await api.post("/emprestimos", dados);
    return resposta.data;
}

// Registrar a devolução de um empréstimo
export async function registrarDevolucao(id) {
    const resposta = await api.patch(`/emprestimos/${id}/devolucao`);
    return resposta.data;
}
