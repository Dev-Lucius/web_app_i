import { useEffect, useState } from "react";

import {
  X,
  UserRound,
  Mail,
  UserPlus,
  Pencil,
  LoaderCircle,
} from "lucide-react";

import {
  cadastrarUsuario,
  atualizarUsuario,
} from "../../services/usuarios.service";

import "../../styles/usuario-formulario.css";

/*
|--------------------------------------------------------------------------
| COMPONENTE: USUARIO FORMULARIO
|--------------------------------------------------------------------------
|
| Responsável por:
|
| - Cadastrar novos leitores;
| - Editar leitores existentes;
| - Validar os campos do formulário;
| - Enviar os dados para o backend;
| - Exibir erros de operação;
| - Informar a página quando a operação for concluída.
|
|--------------------------------------------------------------------------
*/

export default function UsuarioFormulario({ usuario, onClose, onSucesso }) {
  /*
    |--------------------------------------------------------------------------
    | ESTADOS DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  // Dados preenchidos pelo usuário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  // Estado de envio
  const [salvando, setSalvando] = useState(false);

  // Mensagem de erro
  const [erro, setErro] = useState("");

  /*
    |--------------------------------------------------------------------------
    | PREENCHIMENTO AUTOMÁTICO PARA EDIÇÃO
    |--------------------------------------------------------------------------
    |
    | Quando recebemos um usuário, os campos são preenchidos.
    | Quando usuario é null, o formulário fica vazio.
    |
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
    } else {
      setNome("");
      setEmail("");
    }

    setErro("");
  }, [usuario]);

  /*
    |--------------------------------------------------------------------------
    | IDENTIFICAR O MODO DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  // Se existir usuário, estamos editando
  const modoEdicao = Boolean(usuario);

  /*
    |--------------------------------------------------------------------------
    | ENVIO DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  async function handleSubmit(event) {
    // Impede o comportamento padrão do formulário
    event.preventDefault();

    // Limpa erros anteriores
    setErro("");

    /*
        |--------------------------------------------------------------------------
        | VALIDAÇÃO DOS CAMPOS
        |--------------------------------------------------------------------------
        */

    const nomeTratado = nome.trim();
    const emailTratado = email.trim();

    // Validar nome
    if (!nomeTratado) {
      setErro("Informe o nome do leitor.");
      return;
    }

    // Validar e-mail
    if (!emailTratado) {
      setErro("Informe o e-mail do leitor.");
      return;
    }

    // Validação básica de e-mail
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(emailTratado)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    /*
        |--------------------------------------------------------------------------
        | PREPARAÇÃO DOS DADOS
        |--------------------------------------------------------------------------
        */

    const dados = {
      nome: nomeTratado,
      email: emailTratado,
    };

    /*
        |--------------------------------------------------------------------------
        | OPERAÇÃO DE CADASTRO OU EDIÇÃO
        |--------------------------------------------------------------------------
        */

    try {
      setSalvando(true);

      let resposta;

      // Se existe usuário, atualizar
      if (modoEdicao) {
        resposta = await atualizarUsuario(usuario.id, dados);

        // Caso contrário, cadastrar
      } else {
        resposta = await cadastrarUsuario(dados);
      }

      /*
            |--------------------------------------------------------------------------
            | SUCESSO
            |--------------------------------------------------------------------------
            */

      // Comunica a conclusão à página
      if (onSucesso) {
        onSucesso(resposta);
      }
    } catch (error) {
      /*
            |--------------------------------------------------------------------------
            | TRATAMENTO DE ERROS
            |--------------------------------------------------------------------------
            */

      const mensagemBackend =
        error.response?.data?.erro || error.response?.data?.mensagem;

      // Erro de e-mail duplicado
      if (
        error.response?.status === 409 ||
        error.response?.data?.codigo === "EMAIL_DUPLICADO"
      ) {
        setErro(mensagemBackend || "Este e-mail já está cadastrado.");

        // Erro de validação
      } else if (error.response?.status === 400) {
        setErro(mensagemBackend || "Verifique os dados informados.");

        // Erro de conexão
      } else if (!error.response && error.code === "ECONNABORTED") {
        setErro("A requisição demorou muito. Tente novamente.");

        // Erros gerais
      } else {
        setErro(
          mensagemBackend ||
            "Não foi possível salvar o leitor. Tente novamente.",
        );
      }
    } finally {
      // Libera o formulário
      setSalvando(false);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | FECHAMENTO DO MODAL
    |--------------------------------------------------------------------------
    */

  function handleFechar() {
    // Evita fechar durante o envio
    if (salvando) {
      return;
    }

    onClose();
  }

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div
      className="usuario-formulario__overlay"
      onMouseDown={(event) => {
        // Fecha somente se clicar no fundo do modal
        if (event.target === event.currentTarget && !salvando) {
          handleFechar();
        }
      }}
    >
      {/* Modal */}
      <div className="usuario-formulario__modal">
        {/* Cabeçalho */}
        <header className="usuario-formulario__header">
          <div className="usuario-formulario__header-info">
            <div className="usuario-formulario__icone">
              {modoEdicao ? <Pencil size={21} /> : <UserPlus size={21} />}
            </div>

            <div>
              <h2>{modoEdicao ? "Editar leitor" : "Novo leitor"}</h2>

              <p>
                {modoEdicao
                  ? "Atualize os dados do leitor."
                  : "Cadastre um novo leitor na biblioteca."}
              </p>
            </div>
          </div>

          {/* Botão fechar */}
          <button
            type="button"
            className="usuario-formulario__fechar"
            onClick={handleFechar}
            disabled={salvando}
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </header>

        {/* Formulário */}
        <form className="usuario-formulario" onSubmit={handleSubmit}>
          {/* Campo Nome */}
          <div className="usuario-formulario__campo">
            <label htmlFor="usuario-nome">Nome completo</label>

            <div className="usuario-formulario__input-wrapper">
              <UserRound
                size={18}
                className="usuario-formulario__input-icone"
              />

              <input
                id="usuario-nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite o nome completo"
                required
                maxLength={150}
                disabled={salvando}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Campo E-mail */}
          <div className="usuario-formulario__campo">
            <label htmlFor="usuario-email">E-mail</label>

            <div className="usuario-formulario__input-wrapper">
              <Mail size={18} className="usuario-formulario__input-icone" />

              <input
                id="usuario-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemplo@email.com"
                required
                maxLength={254}
                disabled={salvando}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="usuario-formulario__erro">
              <span>{erro}</span>
            </div>
          )}

          {/* Informação */}
          <div className="usuario-formulario__aviso">
            <UserRound size={17} />

            <p>
              Este cadastro é destinado aos leitores da biblioteca. Os leitores
              não possuem acesso ao painel administrativo.
            </p>
          </div>

          {/* Botões */}
          <footer className="usuario-formulario__acoes">
            {/* Cancelar */}
            <button
              type="button"
              className="usuario-formulario__botao-cancelar"
              onClick={handleFechar}
              disabled={salvando}
            >
              Cancelar
            </button>

            {/* Salvar */}
            <button
              type="submit"
              className="usuario-formulario__botao-salvar"
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="usuario-formulario__spinner"
                  />
                  Salvando...
                </>
              ) : (
                <>{modoEdicao ? "Salvar alterações" : "Cadastrar leitor"}</>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
