
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| LISTAR TODOS OS EMPRÉSTIMOS
|--------------------------------------------------------------------------
*/
export async function listarEmprestimosService() {
    return await prisma.emprestimo.findMany({
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                },
            },
            livro: true,
        },
        orderBy: {
            id: "asc",
        },
    });
}

/*
|--------------------------------------------------------------------------
| BUSCAR EMPRÉSTIMO POR ID
|--------------------------------------------------------------------------
*/
export async function buscarEmprestimoPorIdService(id) {
    return await prisma.emprestimo.findUnique({
        where: {
            id,
        },
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                },
            },
            livro: true,
        },
    });
}

/*
|--------------------------------------------------------------------------
| LISTAR EMPRÉSTIMOS DE UM USUÁRIO
|--------------------------------------------------------------------------
*/
export async function listarEmprestimosPorUsuarioService(usuarioId) {
    return await prisma.emprestimo.findMany({
        where: {
            usuarioId,
        },
        include: {
            usuario: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                },
            },
            livro: true,
        },
        orderBy: {
            dataEmprestimo: "desc",
        },
    });
}

/*
|--------------------------------------------------------------------------
| CADASTRAR EMPRÉSTIMO
|--------------------------------------------------------------------------
*/
export async function cadastrarEmprestimoService(dados) {
    const dataPrevistaDevolucao = new Date(
        dados.dataPrevistaDevolucao
    );

    if (
        Number.isNaN(dataPrevistaDevolucao.getTime()) ||
        dataPrevistaDevolucao <= new Date()
    ) {
        const error = new Error(
            "A data prevista de devolução deve ser uma data futura válida."
        );

        error.code = "DATA_DEVOLUCAO_INVALIDA";
        throw error;
    }

    return await prisma.$transaction(async (tx) => {

        // Verificando se o usuário existe
        const usuario = await tx.usuario.findUnique({
            where: {
                id: dados.usuarioId,
            },
            select: {
                id: true,
            },
        });

        if (!usuario) {
            const error = new Error("Usuário não encontrado.");
            error.code = "USUARIO_NAO_ENCONTRADO";
            throw error;
        }

        // Verificando se o livro existe
        const livro = await tx.livro.findUnique({
            where: {
                id: dados.livroId,
            },
            select: {
                id: true,
                disponivel: true,
            },
        });

        if (!livro) {
            const error = new Error("Livro não encontrado.");
            error.code = "LIVRO_NAO_ENCONTRADO";
            throw error;
        }

        if (!livro.disponivel) {
            const error = new Error("Este livro não está disponível.");
            error.code = "LIVRO_INDISPONIVEL";
            throw error;
        }

        // Reservando o livro de forma condicional
        const livroAtualizado = await tx.livro.updateMany({
            where: {
                id: dados.livroId,
                disponivel: true,
            },
            data: {
                disponivel: false,
            },
        });

        // Evita dois empréstimos simultâneos do mesmo livro
        if (livroAtualizado.count === 0) {
            const error = new Error(
                "Este livro não está mais disponível."
            );

            error.code = "LIVRO_INDISPONIVEL";
            throw error;
        }

        // Criando o empréstimo
        return await tx.emprestimo.create({
            data: {
                usuarioId: dados.usuarioId,
                livroId: dados.livroId,
                dataPrevistaDevolucao,
                status: "ATIVO",
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                livro: true,
            },
        });
    });
}

/*
|--------------------------------------------------------------------------
| REGISTRAR DEVOLUÇÃO
|--------------------------------------------------------------------------
*/

export async function registrarDevolucaoService(id) {
    return await prisma.$transaction(async (tx) => {

        // Buscando o empréstimo
        const emprestimo = await tx.emprestimo.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                livroId: true,
                status: true,
            },
        });

        if (!emprestimo) {
            const error = new Error("Empréstimo não encontrado.");
            error.code = "EMPRESTIMO_NAO_ENCONTRADO";
            throw error;
        }

        // Finalizando somente se ainda estiver ativo
        const resultado = await tx.emprestimo.updateMany({
            where: {
                id,
                status: "ATIVO",
            },
            data: {
                dataDevolucao: new Date(),
                status: "DEVOLVIDO",
            },
        });

        if (resultado.count === 0) {
            const error = new Error(
                "Este empréstimo já foi finalizado."
            );

            error.code = "EMPRESTIMO_JA_FINALIZADO";
            throw error;
        }

        // Liberando o livro
        await tx.livro.update({
            where: {
                id: emprestimo.livroId,
            },
            data: {
                disponivel: true,
            },
        });

        // Retornando o empréstimo atualizado
        return await tx.emprestimo.findUnique({
            where: {
                id,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                livro: true,
            },
        });
    });
}
