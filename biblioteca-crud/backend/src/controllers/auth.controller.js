import {
    autenticarUsuarioService,
    buscarUsuarioAutenticadoService,
} from "../services/auth.service.js";

/*
|--------------------------------------------------------------------------
| REALIZAR LOGIN
|--------------------------------------------------------------------------
*/
export async function login(req, res) {
    try {
        const { email, senha } = req.body ?? {};

        // 1. Validar campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha são obrigatórios.",
            });
        }

        // 2. Validar tipos dos campos
        if (
            typeof email !== "string" ||
            typeof senha !== "string"
        ) {
            return res.status(400).json({
                erro: "Email e senha devem ser strings.",
            });
        }

        // 3. Normalizar email
        const emailNormalizado = email.trim().toLowerCase();

        // 4. Validar email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailNormalizado ||
            emailNormalizado.length > 254 ||
            !emailValido.test(emailNormalizado)
        ) {
            return res.status(400).json({
                erro: "Informe um email válido.",
            });
        }

        // 5. Validar senha
        if (senha.trim().length === 0) {
            return res.status(400).json({
                erro: "A senha não pode estar vazia.",
            });
        }

        // 6. Autenticar usuário
        const resultado = await autenticarUsuarioService({
            email: emailNormalizado,
            senha,
        });

        // 7. Retornar resultado
        return res.status(200).json({
            mensagem: "Autenticação realizada com sucesso.",
            ...resultado,
        });

    } catch (error) {
        console.error("Erro ao realizar login:", error);

        if (error.code === "CREDENCIAIS_INVALIDAS") {
            return res.status(401).json({
                erro: "Email ou senha incorretos.",
            });
        }

        return res.status(500).json({
            erro: "Erro interno ao realizar autenticação.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR USUÁRIO AUTENTICADO
|--------------------------------------------------------------------------
*/
export async function buscarUsuarioAutenticado(req, res) {
    try {
        const usuario = await buscarUsuarioAutenticadoService(
            req.userId
        );

        return res.status(200).json({
            mensagem: "Usuário autenticado.",
            usuario,
        });

    } catch (error) {
        console.error("Erro ao buscar usuário autenticado:", error);

        if (error.code === "USUARIO_NAO_ENCONTRADO") {
            return res.status(404).json({
                erro: error.message,
            });
        }

        return res.status(500).json({
            erro: "Erro interno ao buscar usuário.",
        });
    }
}