
import * as usuariosService from "../services/usuario.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR USUÁRIOS
|--------------------------------------------------------------------------
| GET /api/usuarios
*/
export async function listarUsuarios(req, res) {
    console.log("GET /api/usuarios: requisição recebida.");

    try {
        const usuarios = await usuariosService.listarUsuariosService();

        return res.status(200).json(usuarios);

    } catch (error) {
        console.error("Erro ao listar usuários:", error);

        return res.status(500).json({
            erro: "Não foi possível listar os usuários.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR USUÁRIO POR ID
|--------------------------------------------------------------------------
| GET /api/usuarios/:id
*/
export async function buscarUsuarioPorId(req, res) {
    console.log("GET /api/usuarios/:id: requisição recebida.");

    try {
        const idUsuario = Number(req.params.id);

        // Validando o ID
        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        const usuario = await usuariosService.buscarUsuarioPorIdService(idUsuario);

        if (!usuario) {
            return res.status(404).json({
                erro: "Usuário não encontrado.",
            });
        }

        return res.status(200).json(usuario);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);

        return res.status(500).json({
            erro: "Não foi possível buscar o usuário.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| CADASTRAR USUÁRIO
|--------------------------------------------------------------------------
| POST /api/usuarios
*/

export async function cadastrarUsuario(req, res) {
    try {
        const { nome, email } = req.body ?? {};

        // Validar campos obrigatórios
        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios.",
            });
        }

        // Validar tipos
        if (
            typeof nome !== "string" ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                erro: "Nome e email devem ser strings.",
            });
        }

        // Normalizar dados
        const nomeNormalizado = nome.trim();
        const emailNormalizado = email.trim().toLowerCase();

        // Validar nome
        if (
            !nomeNormalizado ||
            nomeNormalizado.length > 150
        ) {
            return res.status(400).json({
                erro: "Informe um nome válido com até 150 caracteres.",
            });
        }

        // Validar email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            emailNormalizado.length > 254 ||
            !emailValido.test(emailNormalizado)
        ) {
            return res.status(400).json({
                erro: "Informe um email válido.",
            });
        }

        // Cadastrar leitor
        const usuario = await usuariosService.cadastrarUsuarioService({
            nome: nomeNormalizado,
            email: emailNormalizado,
        });

        return res.status(201).json({
            mensagem: "Leitor cadastrado com sucesso.",
            usuario,
        });

    } catch (error) {
        console.error("Erro ao cadastrar leitor:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Este email já está cadastrado.",
                codigo: "EMAIL_DUPLICADO",
            });
        }

        return res.status(500).json({
            erro: "Erro interno ao cadastrar leitor.",
        });
    }
}


/*
|--------------------------------------------------------------------------
| ATUALIZAR USUÁRIO
|--------------------------------------------------------------------------
| PUT /api/usuarios/:id
*/

export async function atualizarUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const { nome, email } = req.body ?? {};

        // Validar ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do usuário inválido.",
            });
        }

        // Validar campos obrigatórios
        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios.",
            });
        }

        // Validar tipos
        if (
            typeof nome !== "string" ||
            typeof email !== "string"
        ) {
            return res.status(400).json({
                erro: "Nome e email devem ser strings.",
            });
        }

        const nomeNormalizado = nome.trim();
        const emailNormalizado = email.trim().toLowerCase();

        // Validar nome
        if (
            !nomeNormalizado ||
            nomeNormalizado.length > 150
        ) {
            return res.status(400).json({
                erro: "Informe um nome válido com até 150 caracteres.",
            });
        }

        // Validar email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            emailNormalizado.length > 254 ||
            !emailValido.test(emailNormalizado)
        ) {
            return res.status(400).json({
                erro: "Informe um email válido.",
            });
        }

        const usuario = await usuariosService.atualizarUsuarioService(
            id,
            {
                nome: nomeNormalizado,
                email: emailNormalizado,
            }
        );

        return res.status(200).json({
            mensagem: "Leitor atualizado com sucesso.",
            usuario,
        });

    } catch (error) {
        console.error("Erro ao atualizar leitor:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Leitor não encontrado.",
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                erro: "Este email já está cadastrado.",
                codigo: "EMAIL_DUPLICADO",
            });
        }

        return res.status(500).json({
            erro: "Erro interno ao atualizar leitor.",
        });
    }
}


/*
|--------------------------------------------------------------------------
| DELETAR USUÁRIO
|--------------------------------------------------------------------------
| DELETE /api/usuarios/:id
*/
export async function deletarUsuario(req, res) {
    console.log("DELETE /api/usuarios/:id: requisição recebida.");

    try {
        const idUsuario = Number(req.params.id);

        // Validando o ID
        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                erro: "ID inválido.",
            });
        }

        await usuariosService.deletarUsuarioService(idUsuario);

        return res.status(204).send();

    } catch (error) {
        console.error("Erro ao deletar usuário:", error);

        // Usuário não encontrado
        if (error.code === "P2025") {
            return res.status(404).json({
                erro: "Usuário não encontrado.",
            });
        }

        // Usuário possui empréstimos associados
        if (error.code === "P2003") {
            return res.status(409).json({
                erro: "Não é possível excluir este usuário, pois existem empréstimos associados.",
            });
        }

        return res.status(500).json({
            erro: "Não foi possível deletar o usuário.",
        });
    }
}
