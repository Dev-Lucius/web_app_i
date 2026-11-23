
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| LISTAR AUTORES
|--------------------------------------------------------------------------
| Retorna todos os autores cadastrados.
*/
export async function listarAutoresService() {
    return prisma.autor.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

/*
|--------------------------------------------------------------------------
| BUSCAR AUTOR POR ID
|--------------------------------------------------------------------------
| Busca um autor específico pelo seu identificador.
*/
export async function buscarAutorPorIdService(id) {
    return prisma.autor.findUnique({
        where: {
            id,
        },
        include: {
            livros: {
                include: {
                    livro: true,
                },
            },
        },
    });
}

/*
|--------------------------------------------------------------------------
| CADASTRAR AUTOR
|--------------------------------------------------------------------------
| Cadastra um novo autor no banco de dados.
*/
export async function cadastrarAutorService(dados) {
    const { nome, biografia } = dados;

    return prisma.autor.create({
        data: {
            nome: nome.trim(),
            biografia: biografia?.trim() || null,
        },
    });
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR AUTOR
|--------------------------------------------------------------------------
| Atualiza os dados de um autor existente.
*/
export async function atualizarAutorService(id, dados) {
    const { nome, biografia } = dados;

    return prisma.autor.update({
        where: {
            id,
        },
        data: {
            nome: nome.trim(),
            biografia: biografia?.trim() || null,
        },
    });
}

/*
|--------------------------------------------------------------------------
| DELETAR AUTOR
|--------------------------------------------------------------------------
| Remove um autor pelo seu identificador.
*/
export async function deletarAutorService(id) {
    const autor = await prisma.autor.findUnique({
        where: { id },
        include: {
            livros: true,
        },
    });

    if (!autor) {
        return null;
    }

    if (autor.livros.length > 0) {
        throw new Error("AUTOR_POSSUI_LIVROS");
    }

    return prisma.autor.delete({
        where: { id },
    });
}