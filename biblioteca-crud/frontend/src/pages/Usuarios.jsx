import { useEffect, useMemo, useState } from "react";

import {
  Users,
  BookOpen,
  UserPlus,
  Search,
  AlertCircle,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";

// Serviços
import {
  listarUsuarios,
  buscarUsuarioPorId,
  deletarUsuario,
} from "../services/usuarios.service";

// Componentes
import UsuarioTabela from "../components/usuario/UsuarioTabela";
import UsuarioFormulario from "../components/usuario/UsuarioFormulario";
import UsuarioDetalhes from "../components/usuario/UsuarioDetalhes";

// Estilos
import "../styles/usuarios.css";

/*
|--------------------------------------------------------------------------
| PÁGINA DE USUÁRIOS
|--------------------------------------------------------------------------
|
| Responsável pelo gerenciamento dos leitores cadastrados na biblioteca.
|
| Funcionalidades:
|
| - Listagem de leitores;
| - Pesquisa por nome ou e-mail;
| - Cadastro de leitores;
| - Edição de leitores;
| - Visualização de detalhes;
| - Histórico de empréstimos;
| - Exclusão de leitores;
|
|--------------------------------------------------------------------------
*/

export default function Usuarios() {
  /*
    |--------------------------------------------------------------------------
    | 1. ESTADOS DA PÁGINA
    |--------------------------------------------------------------------------
    */

  // Lista de leitores recebida do backend
  const [usuarios, setUsuarios] = useState([]);

  // Texto digitado na pesquisa
  const [pesquisa, setPesquisa] = useState("");

  // Estado de carregamento da listagem
  const [carregando, setCarregando] = useState(true);

  // Mensagem de erro da página
  const [erro, setErro] = useState("");

  // Controle de atualização da listagem
  const [recarregar, setRecarregar] = useState(0);

  // ID do leitor que está sendo excluído
  const [excluindoId, setExcluindoId] = useState(null);

  /*
    |--------------------------------------------------------------------------
    | 2. ESTADOS DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  // Controla a abertura do modal
  const [formularioAberto, setFormularioAberto] = useState(false);

  // Guarda o leitor selecionado para edição
  // Quando null, o formulário funciona em modo de cadastro
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  /*
    |--------------------------------------------------------------------------
    | 3. ESTADOS DOS DETALHES
    |--------------------------------------------------------------------------
    */

  // Controla a abertura do modal de detalhes
  const [detalhesAberto, setDetalhesAberto] = useState(false);

  // Guarda o leitor selecionado para visualização
  const [usuarioDetalhes, setUsuarioDetalhes] = useState(null);

  /*
    |--------------------------------------------------------------------------
    | 4. CARREGAR USUÁRIOS
    |--------------------------------------------------------------------------
    |
    | A listagem é carregada quando a página é aberta.
    |
    | O estado recarregar permite solicitar uma nova consulta depois
    | de cadastrar, editar ou excluir um leitor.
    |
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await listarUsuarios();

        // Aceita tanto uma lista direta quanto um objeto
        // contendo a propriedade usuarios.
        const lista = Array.isArray(resposta)
          ? resposta
          : (resposta?.usuarios ?? []);

        setUsuarios(lista);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);

        setErro(
          error.response?.data?.erro ||
            error.response?.data?.mensagem ||
            "Não foi possível carregar os leitores.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, [recarregar]);

  /*
    |--------------------------------------------------------------------------
    | 5. PESQUISA DE USUÁRIOS
    |--------------------------------------------------------------------------
    |
    | Filtra os leitores pelo nome ou endereço de e-mail.
    |
    | useMemo evita recalcular a lista filtrada quando outros estados
    | da página são atualizados.
    |
    |--------------------------------------------------------------------------
    */

  const usuariosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    if (!termo) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const nome = usuario.nome?.toLowerCase() || "";
      const email = usuario.email?.toLowerCase() || "";

      return nome.includes(termo) || email.includes(termo);
    });
  }, [usuarios, pesquisa]);

  /*
    |--------------------------------------------------------------------------
    | 6. INDICADORES
    |--------------------------------------------------------------------------
    */

  // Soma a quantidade de empréstimos de todos os leitores.
  //
  // O backend pode fornecer essa informação através de:
  // - usuario.emprestimos
  // - usuario._count.emprestimos

  const totalEmprestimos = useMemo(() => {
    return usuarios.reduce((total, usuario) => {
      const quantidade =
        usuario._count?.emprestimos ?? usuario.emprestimos?.length ?? 0;

      return total + quantidade;
    }, 0);
  }, [usuarios]);

  /*
    |--------------------------------------------------------------------------
    | 7. ABRIR FORMULÁRIO DE CADASTRO
    |--------------------------------------------------------------------------
    */

  function abrirCadastro() {
    setUsuarioEditando(null);
    setFormularioAberto(true);
  }

  /*
    |--------------------------------------------------------------------------
    | 8. ABRIR FORMULÁRIO DE EDIÇÃO
    |--------------------------------------------------------------------------
    */

  function abrirEdicao(usuario) {
    setUsuarioEditando(usuario);
    setFormularioAberto(true);
  }

  /*
    |--------------------------------------------------------------------------
    | 9. FECHAR FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  function fecharFormulario() {
    setFormularioAberto(false);
    setUsuarioEditando(null);
  }

  /*
    |--------------------------------------------------------------------------
    | 10. FINALIZAR CADASTRO OU EDIÇÃO
    |--------------------------------------------------------------------------
    |
    | Esta função é chamada pelo UsuarioFormulario depois que o backend
    | confirma a operação.
    |
    |--------------------------------------------------------------------------
    */

  function salvarSucesso() {
    fecharFormulario();

    // Atualiza a listagem para mostrar os dados mais recentes.
    setRecarregar((atual) => atual + 1);
  }

  /*
    |--------------------------------------------------------------------------
    | 11. ABRIR DETALHES DO LEITOR
    |--------------------------------------------------------------------------
    |
    | Primeiro mostramos os dados disponíveis na listagem.
    | Depois buscamos os dados completos do leitor no backend.
    |
    | Essa segunda consulta é importante porque o histórico de
    | empréstimos pode não estar incluído na listagem geral.
    |
    |--------------------------------------------------------------------------
    */

  async function abrirDetalhes(usuario) {
    setUsuarioDetalhes(usuario);
    setDetalhesAberto(true);

    try {
      const resposta = await buscarUsuarioPorId(usuario.id);

      // Aceita um objeto direto ou uma resposta no formato
      // { usuario: {...} }.
      const usuarioCompleto = resposta?.usuario ?? resposta;

      if (usuarioCompleto) {
        setUsuarioDetalhes(usuarioCompleto);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);

      // Se a consulta falhar, mantemos os dados da listagem
      // para que o modal continue disponível.
    }
  }

  /*
    |--------------------------------------------------------------------------
    | 12. FECHAR DETALHES
    |--------------------------------------------------------------------------
    */

  function fecharDetalhes() {
    setDetalhesAberto(false);
    setUsuarioDetalhes(null);
  }

  /*
    |--------------------------------------------------------------------------
    | 13. EXCLUIR LEITOR
    |--------------------------------------------------------------------------
    |
    | Antes da exclusão, solicitamos confirmação ao administrador.
    |
    |--------------------------------------------------------------------------
    */

  async function excluirUsuario(usuario) {
    const confirmar = window.confirm(
      `Tem certeza de que deseja excluir o leitor "${usuario.nome}"?\n\n` +
        "Essa operação não poderá ser desfeita.",
    );

    if (!confirmar) {
      return;
    }

    try {
      setExcluindoId(usuario.id);
      setErro("");

      await deletarUsuario(usuario.id);

      // Se o leitor excluído estiver aberto nos detalhes,
      // fechamos o modal.
      if (usuarioDetalhes?.id === usuario.id) {
        fecharDetalhes();
      }

      // Atualiza a listagem.
      setRecarregar((atual) => atual + 1);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);

      setErro(
        error.response?.data?.erro ||
          error.response?.data?.mensagem ||
          "Não foi possível excluir o leitor.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | 14. ATUALIZAR LISTAGEM MANUALMENTE
    |--------------------------------------------------------------------------
    */

  function atualizarListagem() {
    setRecarregar((atual) => atual + 1);
  }

  /*
    |--------------------------------------------------------------------------
    | 15. RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div className="usuarios-page">
      {/*----------------------------------------------------------
                CABEÇALHO
            ----------------------------------------------------------*/}

      <header className="usuarios-header">
        <div className="usuarios-header__titulo">
          <h1>Leitores</h1>

          <p>Gerencie os leitores cadastrados na biblioteca.</p>
        </div>

        <div className="usuarios-header__acoes">
          <button
            type="button"
            className="usuarios-botao-novo"
            onClick={abrirCadastro}
          >
            <UserPlus size={17} />

            <span>Novo leitor</span>
          </button>
        </div>
      </header>

      {/*----------------------------------------------------------
                MENSAGEM DE ERRO
            ----------------------------------------------------------*/}

      {erro && (
        <div className="usuarios-erro">
          <AlertCircle size={19} />

          <div className="usuarios-erro__conteudo">
            <strong>Não foi possível concluir a operação</strong>

            <p>{erro}</p>
          </div>

          <button
            type="button"
            className="usuarios-filtros__limpar"
            onClick={atualizarListagem}
            title="Tentar carregar novamente"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      )}

      {/*----------------------------------------------------------
                INDICADORES
            ----------------------------------------------------------*/}

      <section className="usuarios-indicadores">
        {/* Total de leitores */}

        <article className="usuarios-indicador">
          <div className="usuarios-indicador__icone">
            <Users size={23} />
          </div>

          <div className="usuarios-indicador__conteudo">
            <span className="usuarios-indicador__titulo">
              Total de leitores
            </span>

            <strong className="usuarios-indicador__valor">
              {carregando ? "—" : usuarios.length}
            </strong>

            <span className="usuarios-indicador__descricao">
              Leitores cadastrados
            </span>
          </div>
        </article>

        {/* Total de empréstimos */}

        <article className="usuarios-indicador">
          <div className="usuarios-indicador__icone usuarios-indicador__icone--emprestimos">
            <BookOpen size={23} />
          </div>

          <div className="usuarios-indicador__conteudo">
            <span className="usuarios-indicador__titulo">
              Empréstimos registrados
            </span>

            <strong className="usuarios-indicador__valor">
              {carregando ? "—" : totalEmprestimos}
            </strong>

            <span className="usuarios-indicador__descricao">
              Histórico dos leitores
            </span>
          </div>
        </article>
      </section>

      {/*----------------------------------------------------------
                LISTAGEM
            ----------------------------------------------------------*/}

      <section className="usuarios-listagem">
        {/* Cabeçalho da listagem */}

        <div className="usuarios-listagem__header">
          <div className="usuarios-listagem__titulo">
            <h2>Leitores cadastrados</h2>

            <p>Consulte e gerencie os registros da biblioteca.</p>
          </div>

          <span className="usuarios-listagem__contador">
            {carregando ? "..." : usuariosFiltrados.length}
          </span>
        </div>

        {/* Pesquisa */}

        <div className="usuarios-filtros">
          <div className="usuarios-filtros__pesquisa">
            <Search size={17} className="usuarios-filtros__icone" />

            <input
              type="text"
              className="usuarios-filtros__input"
              placeholder="Pesquisar por nome ou e-mail..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>

          {pesquisa && (
            <button
              type="button"
              className="usuarios-filtros__limpar"
              onClick={() => setPesquisa("")}
            >
              Limpar pesquisa
            </button>
          )}
        </div>

        {/* Conteúdo da listagem */}

        {carregando ? (
          <div className="usuarios-carregando">
            <LoaderCircle size={30} className="usuarios-carregando__spinner" />

            <span>Carregando leitores...</span>
          </div>
        ) : (
          <UsuarioTabela
            usuarios={usuariosFiltrados}
            onVerDetalhes={abrirDetalhes}
            onEditar={abrirEdicao}
            onExcluir={excluirUsuario}
          />
        )}
      </section>

      {/*----------------------------------------------------------
                MODAL DE CADASTRO E EDIÇÃO
            ----------------------------------------------------------*/}

      {formularioAberto && (
        <UsuarioFormulario
          usuario={usuarioEditando}
          onClose={fecharFormulario}
          onSucesso={salvarSucesso}
        />
      )}

      {/*----------------------------------------------------------
                MODAL DE DETALHES
            ----------------------------------------------------------*/}

      {detalhesAberto && usuarioDetalhes && (
        <UsuarioDetalhes usuario={usuarioDetalhes} onClose={fecharDetalhes} />
      )}
    </div>
  );
}
