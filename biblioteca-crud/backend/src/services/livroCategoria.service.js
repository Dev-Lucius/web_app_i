
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| LISTAR ASSOCIAÇÕES
|--------------------------------------------------------------------------
*/
export async function listarLivroCategoriasService() {
    return await prisma.livroCategoria.findMany({
        include: {
            livro: true,
            categoria: true,
        },
        orderBy: [
            {
                livroId: "asc",
            },
            {
                categoriaId: "asc",
            },
        ],
    });
}

/*
|--------------------------------------------------------------------------
| BUSCAR ASSOCIAÇÃO
|--------------------------------------------------------------------------
*/
export async function buscarLivroCategoriaService(livroId, categoriaId) {
    return await prisma.livroCategoria.findUnique({
        where: {
            livroId_categoriaId: {
                livroId,
                categoriaId,
            },
        },
        include: {
            livro: true,
            categoria: true,
        },
    });
}

/*
|--------------------------------------------------------------------------
| ASSOCIAR CATEGORIA A LIVRO
|--------------------------------------------------------------------------
*/
export async function associarCategoriaAoLivroService(livroId, categoriaId) {
    return await prisma.livroCategoria.create({
        data: {
            livroId,
            categoriaId,
        },
        include: {
            livro: true,
            categoria: true,
        },
    });
}

/*
|--------------------------------------------------------------------------
| DESASSOCIAR CATEGORIA DE LIVRO
|--------------------------------------------------------------------------
*/
export async function desassociarCategoriaDoLivroService(livroId, categoriaId) {
    return await prisma.livroCategoria.delete({
        where: {
            livroId_categoriaId: {
                livroId,
                categoriaId,
            },
        },
    });
}
