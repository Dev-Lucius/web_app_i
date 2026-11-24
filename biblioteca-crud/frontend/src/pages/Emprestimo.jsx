import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// Serviços
import {
  listarEmprestimos,
  registrarDevolucao,
} from "../services/emprestimo.service";

// Componentes
import EmprestimoTabela from "../components/emprestimo/EmprestimoTabela";
import EmprestimoFormulario from "../components/emprestimo/EmprestimoFormulario";
import EmprestimoDetalhes from "../components/emprestimo/EmprestimoDetalhes";

// Estilos
import "../styles/emprestimos.css";
import "../styles/emprestimo-formulario.css";
import "../styles/emprestimo-detalhes.css";

export default function Emprestimos() {
  /*
    |--------------------------------------------------------------------------
    | ESTADOS DA PÁGINA
    |--------------------------------------------------------------------------
    */

  // Lista de empréstimos recebida da API
  const [emprestimos, setEmprestimos] = useState([]);

  // Pesquisa e filtros
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  // Controle da requisição
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recarregar, setRecarregar] = useState(0);

  // Controle dos componentes
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

  // Controle da devolução
  const [devolvendoId, setDevolvendoId] = useState(null);

  /*
    |--------------------------------------------------------------------------
    | CARREGAR EMPRÉSTIMOS
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    let ativo = true;

    async function carregarEmprestimos() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await listarEmprestimos();

        if (ativo) {
          setEmprestimos(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);

        if (ativo) {
          setErro(
            error.response?.data?.erro ||
              "Não foi possível carregar os empréstimos.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarEmprestimos();

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  /*
    |--------------------------------------------------------------------------
    | IDENTIFICAR EMPRÉSTIMOS ATRASADOS
    |--------------------------------------------------------------------------
    */

  function estaAtrasado(emprestimo) {
    if (emprestimo.status !== "ATIVO") {
      return false;
    }

    const dataPrevista = new Date(emprestimo.dataPrevistaDevolucao);

    return dataPrevista < new Date();
  }

  /*
    |--------------------------------------------------------------------------
    | INDICADORES
    |--------------------------------------------------------------------------
    */

  const indicadores = useMemo(() => {
    const total = emprestimos.length;

    const ativos = emprestimos.filter(
      (emprestimo) => emprestimo.status === "ATIVO",
    ).length;

    const devolvidos = emprestimos.filter(
      (emprestimo) => emprestimo.status === "DEVOLVIDO",
    ).length;

    const atrasados = emprestimos.filter((emprestimo) =>
      estaAtrasado(emprestimo),
    ).length;

    return {
      total,
      ativos,
      devolvidos,
      atrasados,
    };
  }, [emprestimos]);

  /*
    |--------------------------------------------------------------------------
    | PESQUISA E FILTROS
    |--------------------------------------------------------------------------
    */

  const emprestimosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    return emprestimos.filter((emprestimo) => {
      // Pesquisa por livro, usuário ou e-mail
      const tituloLivro = emprestimo.livro?.titulo?.toLowerCase() || "";

      const nomeUsuario = emprestimo.usuario?.nome?.toLowerCase() || "";

      const emailUsuario = emprestimo.usuario?.email?.toLowerCase() || "";

      const correspondePesquisa =
        !termo ||
        tituloLivro.includes(termo) ||
        nomeUsuario.includes(termo) ||
        emailUsuario.includes(termo);

      // Filtro por situação
      let correspondeStatus = true;

      switch (filtroStatus) {
        case "ATIVO":
          correspondeStatus =
            emprestimo.status === "ATIVO" && !estaAtrasado(emprestimo);
          break;

        case "DEVOLVIDO":
          correspondeStatus = emprestimo.status === "DEVOLVIDO";
          break;

        case "ATRASADO":
          correspondeStatus = estaAtrasado(emprestimo);
          break;

        default:
          correspondeStatus = true;
      }

      return correspondePesquisa && correspondeStatus;
    });
  }, [emprestimos, pesquisa, filtroStatus]);

  /*
    |--------------------------------------------------------------------------
    | ATUALIZAR LISTAGEM
    |--------------------------------------------------------------------------
    */

  function atualizarListagem() {
    setRecarregar((valor) => valor + 1);
  }

  /*
    |--------------------------------------------------------------------------
    | ABRIR FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  function abrirCadastro() {
    setFormularioAberto(true);
  }

  /*
    |--------------------------------------------------------------------------
    | FECHAR FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  function fecharFormulario() {
    setFormularioAberto(false);
  }

  /*
    |--------------------------------------------------------------------------
    | CADASTRO CONCLUÍDO
    |--------------------------------------------------------------------------
    */

  function salvarSucesso() {
    fecharFormulario();
    atualizarListagem();
  }

  /*
    |--------------------------------------------------------------------------
    | ABRIR DETALHES
    |--------------------------------------------------------------------------
    */

  function abrirDetalhes(emprestimo) {
    setEmprestimoSelecionado(emprestimo);
  }

  /*
    |--------------------------------------------------------------------------
    | FECHAR DETALHES
    |--------------------------------------------------------------------------
    */

  function fecharDetalhes() {
    setEmprestimoSelecionado(null);
  }

  /*
    |--------------------------------------------------------------------------
    | REGISTRAR DEVOLUÇÃO
    |--------------------------------------------------------------------------
    */

  async function handleRegistrarDevolucao(id) {
    const confirmar = window.confirm(
      "Deseja realmente registrar a devolução deste livro?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setDevolvendoId(id);
      setErro("");

      await registrarDevolucao(id);

      // Atualiza a listagem após a devolução
      atualizarListagem();

      // Fecha os detalhes caso estejam abertos
      if (emprestimoSelecionado?.id === id) {
        fecharDetalhes();
      }
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);

      setErro(
        error.response?.data?.erro || "Não foi possível registrar a devolução.",
      );
    } finally {
      setDevolvendoId(null);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <main className="emprestimos">
      {/* CABEÇALHO */}

      <header className="emprestimos__cabecalho">
        <div>
          <span className="emprestimos__subtitulo">CONTROLE DE CIRCULAÇÃO</span>

          <h1>Gerenciamento de Empréstimos</h1>

          <p>
            Acompanhe os empréstimos, controle as devoluções e gerencie a
            circulação dos livros da biblioteca.
          </p>
        </div>

        <button
          type="button"
          className="emprestimos__botao-novo"
          onClick={abrirCadastro}
        >
          <Plus size={19} />
          Novo empréstimo
        </button>
      </header>

      {/* INDICADORES */}

      <section className="emprestimos__indicadores">
        {/* TOTAL */}

        <article className="emprestimos__indicador">
          <div className="emprestimos__indicador-icone">
            <BookOpen size={22} />
          </div>

          <div>
            <span>Total de empréstimos</span>
            <strong>{indicadores.total}</strong>
          </div>
        </article>

        {/* ATIVOS */}

        <article className="emprestimos__indicador">
          <div className="emprestimos__indicador-icone">
            <Clock size={22} />
          </div>

          <div>
            <span>Em andamento</span>
            <strong>{indicadores.ativos - indicadores.atrasados}</strong>
          </div>
        </article>

        {/* ATRASADOS */}

        <article className="emprestimos__indicador">
          <div className="emprestimos__indicador-icone">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Em atraso</span>
            <strong>{indicadores.atrasados}</strong>
          </div>
        </article>

        {/* DEVOLVIDOS */}

        <article className="emprestimos__indicador">
          <div className="emprestimos__indicador-icone">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Devolvidos</span>
            <strong>{indicadores.devolvidos}</strong>
          </div>
        </article>
      </section>

      {/* CONTEÚDO PRINCIPAL */}

      <section className="emprestimos__conteudo">
        <div className="emprestimos__conteudo-cabecalho">
          <div>
            <h2>Empréstimos registrados</h2>

            <p>Consulte e acompanhe os empréstimos da biblioteca.</p>
          </div>

          <button
            type="button"
            className="emprestimos__botao-atualizar"
            onClick={atualizarListagem}
            disabled={carregando}
            title="Atualizar empréstimos"
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        </div>

        {/* PESQUISA E FILTROS */}

        <div className="emprestimos__filtros">
          <div className="emprestimos__pesquisa">
            <Search size={19} />

            <input
              type="text"
              placeholder="Pesquisar por livro ou usuário..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>

          <div className="emprestimos__filtro-status">
            <label htmlFor="filtro-status">Situação:</label>

            <select
              id="filtro-status"
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="ATIVO">Em andamento</option>
              <option value="ATRASADO">Em atraso</option>
              <option value="DEVOLVIDO">Devolvidos</option>
            </select>
          </div>
        </div>

        {/* MENSAGEM DE ERRO */}

        {erro && (
          <div className="emprestimos__erro">
            <p>{erro}</p>

            <button type="button" onClick={atualizarListagem}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* CARREGAMENTO */}

        {carregando && (
          <div className="emprestimos__estado">
            <RefreshCw size={22} />

            <p>Carregando empréstimos...</p>
          </div>
        )}

        {/* TABELA */}

        {!carregando && !erro && (
          <EmprestimoTabela
            emprestimos={emprestimosFiltrados}
            onVerDetalhes={abrirDetalhes}
            onRegistrarDevolucao={handleRegistrarDevolucao}
            devolvendoId={devolvendoId}
          />
        )}

        {/* RESULTADO DOS FILTROS */}

        {!carregando && !erro && (
          <div className="emprestimos__resultado">
            Exibindo {emprestimosFiltrados.length} de {emprestimos.length}{" "}
            empréstimos.
          </div>
        )}
      </section>

      {/* FORMULÁRIO DE CADASTRO */}

      {formularioAberto && (
        <EmprestimoFormulario
          onClose={fecharFormulario}
          onSucesso={salvarSucesso}
        />
      )}

      {/* DETALHES DO EMPRÉSTIMO */}

      {emprestimoSelecionado && (
        <EmprestimoDetalhes
          emprestimo={emprestimoSelecionado}
          onClose={fecharDetalhes}
          onRegistrarDevolucao={handleRegistrarDevolucao}
          devolvendoId={devolvendoId}
        />
      )}
    </main>
  );
}
