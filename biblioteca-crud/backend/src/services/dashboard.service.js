
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| BUSCAR DADOS DO DASHBOARD
|--------------------------------------------------------------------------
| Centraliza as consultas necessárias para montar o Dashboard.
|--------------------------------------------------------------------------
*/

export async function buscarDadosDashboardService() {

    const agora = new Date();

    /*
    |--------------------------------------------------------------------------
    | CONSULTAS PRINCIPAIS
    |--------------------------------------------------------------------------
    */

    const [
        totalLivros,
        totalUsuarios,
        emprestimosAtivos,
        emprestimosAtrasados,
        emprestimosRecentes,
        livrosAgrupados,
    ] = await Promise.all([

        // Quantidade total de livros
        prisma.livro.count(),

        // Quantidade total de usuários
        prisma.usuario.count(),

        // Empréstimos ativos
        prisma.emprestimo.count({
            where: {
                status: "ATIVO",
            },
        }),

        // Empréstimos ativos e com prazo vencido
        prisma.emprestimo.count({
            where: {
                status: "ATIVO",
                dataPrevistaDevolucao: {
                    lt: agora,
                },
            },
        }),

        // Cinco empréstimos mais recentes
        prisma.emprestimo.findMany({
            take: 5,
            orderBy: {
                dataEmprestimo: "desc",
            },
            include: {
                usuario: {
                    select: {
                        nome: true,
                    },
                },
                livro: {
                    select: {
                        titulo: true,
                    },
                },
            },
        }),

        // Agrupamento de empréstimos por livro
        prisma.emprestimo.groupBy({
            by: ["livroId"],
            _count: {
                livroId: true,
            },
            orderBy: {
                _count: {
                    livroId: "desc",
                },
            },
            take: 5,
        }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | BUSCAR OS NOMES DOS LIVROS POPULARES
    |--------------------------------------------------------------------------
    */

    const idsLivros = livrosAgrupados.map(
        (item) => item.livroId
    );

    const livros = idsLivros.length > 0
        ? await prisma.livro.findMany({
            where: {
                id: {
                    in: idsLivros,
                },
            },
            select: {
                id: true,
                titulo: true,
            },
        })
        : [];

    // Associar cada livro à quantidade de empréstimos
    const livrosPopulares = livrosAgrupados.map((item) => {

        const livro = livros.find(
            (livro) => livro.id === item.livroId
        );

        return {
            id: item.livroId,
            titulo: livro?.titulo ?? "Livro não encontrado",
            quantidadeEmprestimos: item._count.livroId,
        };
    });

    /*
    |--------------------------------------------------------------------------
    | RETORNO
    |--------------------------------------------------------------------------
    */

    return {
        estatisticas: {
            totalLivros,
            totalUsuarios,
            emprestimosAtivos,
            emprestimosAtrasados,
        },

        emprestimosRecentes,

        livrosPopulares,
    };
}
