
import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/*
|--------------------------------------------------------------------------
| AUTENTICAR USUÁRIO
|--------------------------------------------------------------------------
*/
export async function autenticarUsuarioService(dados) {

    // 1. Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
        where: {
            email: dados.email,
        },
    });

    // 2. Verificar se o usuário existe
    if (!usuario) {
        const error = new Error("Email ou senha incorretos.");
        error.code = "CREDENCIAIS_INVALIDAS";
        throw error;
    }

    // 3. Permitir acesso ao painel somente para administradores
    if (usuario.perfil !== "ADMIN") {
        const error = new Error("Email ou senha incorretos.");
        error.code = "CREDENCIAIS_INVALIDAS";
        throw error;
    }

    // 4. Verificar se existe uma senha cadastrada
    if (!usuario.senha) {
        const error = new Error("Email ou senha incorretos.");
        error.code = "CREDENCIAIS_INVALIDAS";
        throw error;
    }

    // 5. Comparar senha informada com o hash armazenado
    const senhaValida = await bcrypt.compare(
        dados.senha,
        usuario.senha
    );

    if (!senhaValida) {
        const error = new Error("Email ou senha incorretos.");
        error.code = "CREDENCIAIS_INVALIDAS";
        throw error;
    }

    // 6. Verificar configuração da chave JWT
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET não foi configurada.");
    }

    // 7. Gerar token JWT
    const token = jwt.sign(
        {
            id: usuario.id,
        },
        secret,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        }
    );

    // 8. Retornar dados públicos e token
    return {
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
        },
        token,
    };
}

/*
|--------------------------------------------------------------------------
| BUSCAR USUÁRIO AUTENTICADO
|--------------------------------------------------------------------------
*/
export async function buscarUsuarioAutenticadoService(usuarioId) {

    const usuario = await prisma.usuario.findUnique({
        where: {
            id: usuarioId,
        },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!usuario) {
        const error = new Error("Usuário não encontrado.");
        error.code = "USUARIO_NAO_ENCONTRADO";
        throw error;
    }

    return usuario;
}
