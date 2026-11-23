import { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  User,
  CalendarDays,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";
import { cadastrarEmprestimo } from "../../services/emprestimo.service";

/*
|--------------------------------------------------------------------------
| FUNÇÕES AUXILIARES
|--------------------------------------------------------------------------
*/

// Retorna a data de amanhã no formato YYYY-MM-DD.
// Assim, o usuário não consegue selecionar uma data que já passou
// ou que possa ser considerada inválida pelo backend.
function obterDataMinima() {
  const data = new Date();

  data.setDate(data.getDate() + 1);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Define uma data inicial de devolução: sete dias a partir de hoje.
function obterDataPadrao() {
  const data = new Date();

  data.setDate(data.getDate() + 7);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Extrai a mensagem de erro retornada pelo backend.
function obterMensagemErro(error) {
  return (
    error.response?.data?.erro ||
    error.response?.data?.mensagem ||
    "Não foi possível concluir a operação. Tente novamente."
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE: EMPRESTIMOFORMULARIO
|--------------------------------------------------------------------------
*/

export default function EmprestimoFormulario({ onClose, onSucesso }) {
  /*
    |--------------------------------------------------------------------------
    | ESTADOS
    |--------------------------------------------------------------------------
    */

  // Dados carregados da API
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);

  // Dados preenchidos no formulário
  const [usuarioId, setUsuarioId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [dataPrevistaDevolucao, setDataPrevistaDevolucao] =
    useState(obterDataPadrao());

  // Controle da interface
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  /*
    |--------------------------------------------------------------------------
    | CARREGAMENTO DE USUÁRIOS E LIVROS
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregandoDados(true);
        setErro("");

        // Busca usuários e livros simultaneamente.
        const [respostaUsuarios, respostaLivros] = await Promise.all([
          api.get("/usuario"),
          api.get("/livros"),
        ]);

        if (!ativo) return;

        // Garante que os dados recebidos sejam arrays.
        const listaUsuarios = Array.isArray(respostaUsuarios.data)
          ? respostaUsuarios.data
          : [];

        const listaLivros = Array.isArray(respostaLivros.data)
          ? respostaLivros.data
          : [];

        setUsuarios(listaUsuarios);

        // Somente livros disponíveis podem receber empréstimos.
        setLivros(listaLivros.filter((livro) => livro.disponivel === true));
      } catch (error) {
        console.error("Erro ao carregar dados do formulário:", error);

        if (ativo) {
          setErro(obterMensagemErro(error));
        }
      } finally {
        if (ativo) {
          setCarregandoDados(false);
        }
      }
    }

    carregarDados();

    // Evita atualizar estados caso o componente seja desmontado.
    return () => {
      ativo = false;
    };
  }, []);

  /*
    |--------------------------------------------------------------------------
    | CADASTRAR EMPRÉSTIMO
    |--------------------------------------------------------------------------
    */

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    // Validação dos campos obrigatórios.
    if (!usuarioId || !livroId || !dataPrevistaDevolucao) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    // Converte os IDs para números antes de enviar ao backend.
    const usuarioSelecionado = Number(usuarioId);
    const livroSelecionado = Number(livroId);

    if (
      !Number.isInteger(usuarioSelecionado) ||
      !Number.isInteger(livroSelecionado)
    ) {
      setErro("Selecione um usuário e um livro válidos.");
      return;
    }

    // A data é enviada em formato ISO, considerando o horário local.
    // Utilizamos meio-dia para evitar problemas de fuso horário.
    const dataDevolucao = new Date(`${dataPrevistaDevolucao}T12:00:00`);

    if (Number.isNaN(dataDevolucao.getTime()) || dataDevolucao <= new Date()) {
      setErro("A data prevista de devolução deve ser futura.");
      return;
    }

    // Estrutura esperada pelo backend.
    const dados = {
      usuarioId: usuarioSelecionado,
      livroId: livroSelecionado,
      dataPrevistaDevolucao: dataDevolucao.toISOString(),
    };

    try {
      setSalvando(true);

      // Realiza o cadastro do empréstimo.
      const resposta = await cadastrarEmprestimo(dados);

      // Informa a página que o cadastro foi concluído.
      if (onSucesso) {
        onSucesso(resposta);
      }
    } catch (error) {
      console.error("Erro ao cadastrar empréstimo:", error);

      setErro(obterMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div
      className="emprestimo-formulario__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !salvando) {
          onClose();
        }
      }}
    >
      <section
        className="emprestimo-formulario"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emprestimo-formulario-titulo"
      >
        {/* Cabeçalho */}
        <header className="emprestimo-formulario__header">
          <div>
            <span className="emprestimo-formulario__etiqueta">
              GESTÃO DE EMPRÉSTIMOS
            </span>

            <h2 id="emprestimo-formulario-titulo">Novo empréstimo</h2>

            <p>Preencha os dados para registrar um novo empréstimo.</p>
          </div>

          <button
            type="button"
            className="emprestimo-formulario__fechar"
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </header>

        {/* Conteúdo */}
        <div className="emprestimo-formulario__conteudo">
          {carregandoDados ? (
            <div className="emprestimo-formulario__carregando">
              <LoaderCircle size={28} className="girando" />

              <p>Carregando usuários e livros...</p>
            </div>
          ) : (
            <>
              {/* Mensagem de erro */}
              {erro && (
                <div className="emprestimo-formulario__erro" role="alert">
                  <AlertCircle size={18} />

                  <span>{erro}</span>
                </div>
              )}

              {/* Verifica se existem usuários e livros */}
              {usuarios.length === 0 || livros.length === 0 ? (
                <div className="emprestimo-formulario__aviso">
                  <AlertCircle size={22} />

                  <div>
                    <strong>Não é possível registrar o empréstimo.</strong>

                    <p>
                      {usuarios.length === 0
                        ? "Não existem usuários cadastrados."
                        : "Não existem livros disponíveis para empréstimo."}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Seleção de usuário */}
                  <div className="emprestimo-formulario__campo">
                    <label htmlFor="emprestimo-usuario">
                      <User size={17} />
                      Usuário
                      <span>*</span>
                    </label>

                    <select
                      id="emprestimo-usuario"
                      value={usuarioId}
                      onChange={(event) => setUsuarioId(event.target.value)}
                      required
                      disabled={salvando}
                    >
                      <option value="">Selecione um usuário</option>

                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome} — {usuario.email}
                        </option>
                      ))}
                    </select>

                    <small>
                      Selecione o usuário responsável pelo empréstimo.
                    </small>
                  </div>

                  {/* Seleção de livro */}
                  <div className="emprestimo-formulario__campo">
                    <label htmlFor="emprestimo-livro">
                      <BookOpen size={17} />
                      Livro
                      <span>*</span>
                    </label>

                    <select
                      id="emprestimo-livro"
                      value={livroId}
                      onChange={(event) => setLivroId(event.target.value)}
                      required
                      disabled={salvando}
                    >
                      <option value="">Selecione um livro disponível</option>

                      {livros.map((livro) => (
                        <option key={livro.id} value={livro.id}>
                          {livro.titulo}
                        </option>
                      ))}
                    </select>

                    <small>Apenas livros disponíveis são exibidos.</small>
                  </div>

                  {/* Data prevista de devolução */}
                  <div className="emprestimo-formulario__campo">
                    <label htmlFor="emprestimo-devolucao">
                      <CalendarDays size={17} />
                      Data prevista de devolução
                      <span>*</span>
                    </label>

                    <input
                      type="date"
                      id="emprestimo-devolucao"
                      value={dataPrevistaDevolucao}
                      onChange={(event) =>
                        setDataPrevistaDevolucao(event.target.value)
                      }
                      min={obterDataMinima()}
                      required
                      disabled={salvando}
                    />

                    <small>Informe uma data posterior à data atual.</small>
                  </div>

                  {/* Resumo */}
                  <div className="emprestimo-formulario__resumo">
                    <div>
                      <BookOpen size={19} />

                      <div>
                        <strong>Empréstimo ativo</strong>

                        <p>
                          Ao confirmar, o livro será marcado como indisponível
                          até sua devolução.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <footer className="emprestimo-formulario__acoes">
                    <button
                      type="button"
                      className="emprestimo-formulario__botao-cancelar"
                      onClick={onClose}
                      disabled={salvando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="emprestimo-formulario__botao-salvar"
                      disabled={salvando}
                    >
                      {salvando ? (
                        <>
                          <LoaderCircle size={17} className="girando" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} />
                          Registrar empréstimo
                        </>
                      )}
                    </button>
                  </footer>
                </form>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
