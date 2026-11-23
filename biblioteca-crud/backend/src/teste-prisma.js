import { prisma } from "./prisma.js";

try {
    console.log("Testando conexão com o Neon...");

    const livros = await prisma.livro.findMany();

    console.log("Conexão com o banco estabelecida!");
    console.log("Livros cadastrados:", livros);

} catch (error) {
    console.error("Erro ao consultar o banco:");

    console.error("Nome:", error.name);
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);

    if (error.cause) {
        console.error("Causa:", error.cause);
    }

} finally {
    await prisma.$disconnect();
}