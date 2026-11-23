
import { prisma } from "../prisma.js";

// Campos públicos do usuário.
// A senha nunca deve ser retornada pela API.
const usuarioPublicoSelect = {
    id: true,
    nome: true,
    email: true,
    perfil: true,
    createdAt: true,
    updatedAt: true,
};

// Listar somente leitores cadastrados.
// O painel administrativo não precisa exibir outras contas ADMIN.
export async function listarUsuariosService() {
    return await prisma.usuario.findMany({
        where: {
            perfil: "LEITOR",
        },

        select: {
            ...usuarioPublicoSelect,

            // Retorna apenas a quantidade de empréstimos.
            _count: {
                select: {
                    emprestimos: true,
                },
            },
        },

        orderBy: {
            id: "asc",
        },
    });
}

// Buscar um leitor pelo ID, incluindo seu histórico de empréstimos.
export async function buscarUsuarioPorIdService(id) {
    return await prisma.usuario.findFirst({
        where: {
            id,
            perfil: "LEITOR",
        },

        select: {
            ...usuarioPublicoSelect,

            emprestimos: {
                select: {
                    id: true,
                    dataEmprestimo: true,
                    dataPrevistaDevolucao: true,
                    dataDevolucao: true,
                    status: true,

                    livro: {
                        select: {
                            id: true,
                            titulo: true,
                            isbn: true,
                        },
                    },
                },

                orderBy: {
                    dataEmprestimo: "desc",
                },
            },
        },
    });
}

// Cadastrar um novo leitor.
// O perfil é definido pelo backend, nunca pelo frontend.
export async function cadastrarUsuarioService(dados) {
    return await prisma.usuario.create({
        data: {
            nome: dados.nome,
            email: dados.email,
            perfil: "LEITOR",
            senha: null,
        },

        select: usuarioPublicoSelect,
    });
}

// Atualizar os dados de um leitor.
// Não permite alterar perfil ou senha por este serviço.
export async function atualizarUsuarioService(id, dados) {
    return await prisma.usuario.update({
        where: {
            id,
            perfil: "LEITOR",
        },

        data: {
            nome: dados.nome,
            email: dados.email,
        },

        select: usuarioPublicoSelect,
    });
}

// Deletar um leitor.
// A restrição de empréstimos continua sendo tratada pelo banco.
export async function deletarUsuarioService(id) {
    return await prisma.usuario.delete({
        where: {
            id,
            perfil: "LEITOR",
        },

        select: usuarioPublicoSelect,
    });
}
