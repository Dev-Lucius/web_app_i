
import * as emprestimosService from "../services/emprestimo.service.js";

/*
|--------------------------------------------------------------------------
| LISTAR TODOS OS EMPRÉSTIMOS
|--------------------------------------------------------------------------
*/
export async function listarEmprestimos(req, res) {
    try {
        const emprestimos =
            await emprestimosService.listarEmprestimosService();

        return res.status(200).json(emprestimos);

    } catch (error) {
        console.error("Erro ao listar empréstimos:", error);

        return res.status(500).json({
            erro: "Erro interno ao listar empréstimos.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| BUSCAR EMPRÉSTIMO POR ID
|--------------------------------------------------------------------------
*/
export async function buscarEmprestimoPorId(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do empréstimo inválido.",
            });
        }

        const emprestimo =
            await emprestimosService.buscarEmprestimoPorIdService(id);

        if (!emprestimo) {
            return res.status(404).json({
                erro: "Empréstimo não encontrado.",
            });
        }

        return res.status(200).json(emprestimo);

    } catch (error) {
        console.error("Erro ao buscar empréstimo:", error);

        return res.status(500).json({
            erro: "Erro interno ao buscar empréstimo.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| LISTAR EMPRÉSTIMOS DE UM USUÁRIO
|--------------------------------------------------------------------------
*/
export async function listarEmprestimosPorUsuario(req, res) {
    try {
        const usuarioId = Number(req.params.usuarioId);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({
                erro: "ID do usuário inválido.",
            });
        }

        const emprestimos =
            await emprestimosService.listarEmprestimosPorUsuarioService(
                usuarioId
            );

        return res.status(200).json(emprestimos);

    } catch (error) {
        console.error("Erro ao listar empréstimos do usuário:", error);

        return res.status(500).json({
            erro: "Erro interno ao listar empréstimos do usuário.",
        });
    }
}

/*
|--------------------------------------------------------------------------
| CADASTRAR EMPRÉSTIMO
|--------------------------------------------------------------------------
*/
export async function cadastrarEmprestimo(req, res) {
    try {
        const {
            usuarioId,
            livroId,
            dataPrevistaDevolucao,
        } = req.body ?? {};

        // Validar usuário
        if (
            !Number.isInteger(usuarioId) ||
            usuarioId <= 0
        ) {
            return res.status(400).json({
                erro: "Informe um ID de usuário válido.",
            });
        }

        // Validar livro
        if (
            !Number.isInteger(livroId) ||
            livroId <= 0
        ) {
            return res.status(400).json({
                erro: "Informe um ID de livro válido.",
            });
        }

        // Validar data prevista
        if (
            typeof dataPrevistaDevolucao !== "string" ||
            Number.isNaN(new Date(dataPrevistaDevolucao).getTime())
        ) {
            return res.status(400).json({
                erro: "Informe uma data prevista de devolução válida.",
            });
        }

        const emprestimo =
            await emprestimosService.cadastrarEmprestimoService({
                usuarioId,
                livroId,
                dataPrevistaDevolucao,
            });

        return res.status(201).json({
            mensagem: "Empréstimo cadastrado com sucesso.",
            emprestimo,
        });

    } catch (error) {
        console.error("Erro ao cadastrar empréstimo:", error);

        switch (error.code) {
            case "USUARIO_NAO_ENCONTRADO":
                return res.status(404).json({
                    erro: error.message,
                });

            case "LIVRO_NAO_ENCONTRADO":
                return res.status(404).json({
                    erro: error.message,
                });

            case "LIVRO_INDISPONIVEL":
                return res.status(409).json({
                    erro: error.message,
                });

            case "DATA_DEVOLUCAO_INVALIDA":
                return res.status(400).json({
                    erro: error.message,
                });

            case "P2003":
                return res.status(404).json({
                    erro: "Usuário ou livro não encontrado.",
                });

            default:
                return res.status(500).json({
                    erro: "Erro interno ao cadastrar empréstimo.",
                });
        }
    }
}

/*
|--------------------------------------------------------------------------
| REGISTRAR DEVOLUÇÃO
|--------------------------------------------------------------------------
*/
export async function registrarDevolucao(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do empréstimo inválido.",
            });
        }

        const emprestimo =
            await emprestimosService.registrarDevolucaoService(id);

        return res.status(200).json({
            mensagem: "Devolução registrada com sucesso.",
            emprestimo,
        });

    } catch (error) {
        console.error("Erro ao registrar devolução:", error);

        switch (error.code) {
            case "EMPRESTIMO_NAO_ENCONTRADO":
                return res.status(404).json({
                    erro: error.message,
                });

            case "EMPRESTIMO_JA_FINALIZADO":
                return res.status(409).json({
                    erro: error.message,
                });

            case "P2025":
                return res.status(404).json({
                    erro: "Empréstimo ou livro não encontrado.",
                });

            default:
                return res.status(500).json({
                    erro: "Erro interno ao registrar devolução.",
                });
        }
    }
}
