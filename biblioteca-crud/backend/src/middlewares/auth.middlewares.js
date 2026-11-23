
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

/*
|--------------------------------------------------------------------------
| MIDDLEWARE DE AUTENTICAÇÃO JWT
|--------------------------------------------------------------------------
*/
export function autenticarToken(req, res, next) {
    try {
        // 1. Obter o cabeçalho Authorization
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                erro: "Token de autenticação não informado.",
            });
        }

        // 2. Verificar o formato Bearer
        const partes = authorization.split(" ");

        if (
            partes.length !== 2 ||
            partes[0] !== "Bearer" ||
            !partes[1]
        ) {
            return res.status(401).json({
                erro: "Formato do token inválido.",
            });
        }

        const token = partes[1];

        // 3. Verificar se a chave secreta está configurada
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET não foi configurada.");

            return res.status(500).json({
                erro: "Erro interno de autenticação.",
            });
        }

        // 4. Verificar assinatura e validade do token
        const decoded = jwt.verify(token, secret);

        // 5. Validar o payload do token
        if (
            typeof decoded !== "object" ||
            decoded === null ||
            !Number.isInteger(decoded.id) ||
            decoded.id <= 0
        ) {
            return res.status(401).json({
                erro: "Payload do token inválido.",
            });
        }

        // 6. Disponibilizar os dados do usuário na requisição
        req.usuario = decoded;
        req.userId = decoded.id;

        // 7. Permitir que a requisição continue
        return next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                erro: "Token expirado. Faça login novamente.",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                erro: "Token inválido.",
            });
        }

        console.error("Erro no middleware de autenticação:", error);

        return res.status(500).json({
            erro: "Erro interno de autenticação.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| MIDDLEWARE DE AUTORIZAÇÃO ADMINISTRATIVA
|--------------------------------------------------------------------------
*/
export async function autorizarAdmin(req, res, next) {
    try {
        // O middleware autenticarToken já validou o JWT
        // e disponibilizou o ID em req.userId.

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: req.userId,
            },
            select: {
                id: true,
                perfil: true,
            },
        });

        // Verifica se o usuário ainda existe
        if (!usuario) {
            return res.status(401).json({
                erro: "Usuário não encontrado. Faça login novamente.",
            });
        }

        // Verifica se o usuário possui perfil administrativo
        if (usuario.perfil !== "ADMIN") {
            return res.status(403).json({
                erro: "Acesso negado. Somente administradores podem realizar esta operação.",
            });
        }

        // Disponibiliza os dados atuais do usuário
        req.usuario = usuario;

        return next();

    } catch (error) {
        console.error("Erro ao verificar autorização administrativa:", error);

        return res.status(500).json({
            erro: "Erro interno ao verificar permissões.",
        });
    }
}
