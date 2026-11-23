import { prisma } from "../prisma.js";

// Listar todos os livros
export async function listarLivrosService() {
    return await prisma.livro.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

// Buscar um livro pelo ID, incluindo autores e categorias
export async function buscarLivroPorIdService(id) {
    return await prisma.livro.findUnique({
        where: {
            id,
        },
        include: {
            autores: {
                include: {
                    autor: true,
                },
            },
            categorias: {
                include: {
                    categoria: true,
                },
            },
        },
    });
}

// Cadastrar um novo livro com autores e categorias
export async function cadastrarLivroService(dados) {
    const {
        titulo,
        isbn,
        anoPublicacao,
        disponivel,
        autorIds,
        categoriaIds,
    } = dados;

    return await prisma.livro.create({
        data: {
            titulo,
            isbn,
            anoPublicacao,
            disponivel,

            autores: {
                create: autorIds.map((autorId) => ({
                    autor: {
                        connect: { id: autorId },
                    },
                })),
            },

            categorias: {
                create: categoriaIds.map((categoriaId) => ({
                    categoria: {
                        connect: { id: categoriaId },
                    },
                })),
            },
        },
        include: {
            autores: {
                include: { autor: true },
            },
            categorias: {
                include: { categoria: true },
            },
        },
    });
}

// Atualizar um livro e seus relacionamentos
export async function atualizarLivroService(id, dados) {
    const {
        titulo,
        isbn,
        anoPublicacao,
        disponivel,
        autorIds,
        categoriaIds,
    } = dados;

    return await prisma.livro.update({
        where: { id },

        data: {
            titulo,
            isbn,
            anoPublicacao,
            disponivel,

            // Remove as associações antigas e cria as novas
            autores: {
                deleteMany: {},
                create: autorIds.map((autorId) => ({
                    autor: {
                        connect: { id: autorId },
                    },
                })),
            },

            categorias: {
                deleteMany: {},
                create: categoriaIds.map((categoriaId) => ({
                    categoria: {
                        connect: { id: categoriaId },
                    },
                })),
            },
        },

        include: {
            autores: {
                include: { autor: true },
            },
            categorias: {
                include: { categoria: true },
            },
        },
    });
}

// Deletar um livro
export async function deletarLivroService(id) {
    return await prisma.livro.delete({
        where: { id },
    });
}