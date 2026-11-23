
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| LISTAR ASSOCIAÇÕES
|--------------------------------------------------------------------------
*/
export async function listarLivroAutoresService() {
    return await prisma.livroAutor.findMany({
        include: {
            livro: true,
            autor: true,
        },
        orderBy: [
            {
                livroId: "asc",
            },
            {
                autorId: "asc",
            },
        ],
    });
}

/*
|--------------------------------------------------------------------------
| BUSCAR ASSOCIAÇÃO
|--------------------------------------------------------------------------
*/
export async function buscarLivroAutorService(livroId, autorId) {
    return await prisma.livroAutor.findUnique({
        where: {
            livroId_autorId: {
                livroId,
                autorId,
            },
        },
        include: {
            livro: true,
            autor: true,
        },
    });
}

/*
|--------------------------------------------------------------------------
| ASSOCIAR AUTOR A LIVRO
|--------------------------------------------------------------------------
*/
export async function associarAutorAoLivroService(livroId, autorId) {
    return await prisma.livroAutor.create({
        data: {
            livroId,
            autorId,
        },
        include: {
            livro: true,
            autor: true,
        },
    });
}

/*
|--------------------------------------------------------------------------
| DESASSOCIAR AUTOR DE LIVRO
|--------------------------------------------------------------------------
*/
export async function desassociarAutorDoLivroService(livroId, autorId) {
    return await prisma.livroAutor.delete({
        where: {
            livroId_autorId: {
                livroId,
                autorId,
            },
        },
    });
}
