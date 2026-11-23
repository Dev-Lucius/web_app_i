
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| LISTAR CATEGORIAS
|--------------------------------------------------------------------------
*/
export async function listarCategoriasService() {
    return await prisma.categoria.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

/*
|--------------------------------------------------------------------------
| BUSCAR CATEGORIA POR ID
|--------------------------------------------------------------------------
*/
export async function buscarCategoriaPorIdService(id) {
    return await prisma.categoria.findUnique({
        where: {
            id,
        },
    });
}

/*
|--------------------------------------------------------------------------
| CADASTRAR CATEGORIA
|--------------------------------------------------------------------------
*/
export async function cadastrarCategoriaService(dados) {
    return await prisma.categoria.create({
        data: {
            nome: dados.nome.trim(),
            descricao: dados.descricao?.trim() || null,
        },
    });
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR CATEGORIA
|--------------------------------------------------------------------------
*/
export async function atualizarCategoriaService(id, dados) {
    return await prisma.categoria.update({
        where: {
            id,
        },
        data: {
            nome: dados.nome.trim(),
            descricao: dados.descricao?.trim() || null,
        },
    });
}

/*
|--------------------------------------------------------------------------
| DELETAR CATEGORIA
|--------------------------------------------------------------------------
*/
export async function deletarCategoriaService(id) {
    return await prisma.categoria.delete({
        where: {
            id,
        },
    });
}
