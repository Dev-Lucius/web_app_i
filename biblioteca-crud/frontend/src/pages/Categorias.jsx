import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Layers3, FileText, FileX } from "lucide-react";
import { listarCategorias } from "../services/categorias.service";
import CategoriaTabela from "../components/categoria/CategoriaTabela";
import CategoriaFormulario from "../components/categoria/CategoriaFormulario";
import "../styles/categoria-formulario.css";
import "../styles/categorias.css";

export default function Categorias() {
  // Dados da página
  const [categorias, setCategorias] = useState([]);

  // Controle da pesquisa
  const [pesquisa, setPesquisa] = useState("");

  // Controle de carregamento e erros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Permite atualizar a listagem após operações
  const [recarregar, setRecarregar] = useState(0);

  // Controle do formulário
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  /*
    |--------------------------------------------------------------------------
    | CARREGAR CATEGORIAS
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    async function carregarCategorias() {
      try {
        setCarregando(true);
        setErro("");

        const dados = await listarCategorias();

        setCategorias(dados);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);

        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar as categorias.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarCategorias();
  }, [recarregar]);

  /*
    |--------------------------------------------------------------------------
    | FILTRAR CATEGORIAS
    |--------------------------------------------------------------------------
    */

  const categoriasFiltradas = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    if (!termo) {
      return categorias;
    }

    return categorias.filter((categoria) => {
      const nome = categoria.nome?.toLowerCase() || "";
      const descricao = categoria.descricao?.toLowerCase() || "";

      return nome.includes(termo) || descricao.includes(termo);
    });
  }, [categorias, pesquisa]);

  /*
    |--------------------------------------------------------------------------
    | INDICADORES
    |--------------------------------------------------------------------------
    */

  const totalCategorias = categorias.length;

  const categoriasComDescricao = categorias.filter((categoria) =>
    categoria.descricao?.trim(),
  ).length;

  const categoriasSemDescricao = totalCategorias - categoriasComDescricao;

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
    | CONTROLE DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  // Abrir formulário para cadastrar
  function abrirCadastro() {
    setCategoriaSelecionada(null);
    setFormularioAberto(true);
  }

  // Abrir formulário para editar
  function abrirEdicao(categoria) {
    setCategoriaSelecionada(categoria);
    setFormularioAberto(true);
  }

  // Fechar formulário
  function fecharFormulario() {
    setFormularioAberto(false);
    setCategoriaSelecionada(null);
  }

  // Executar após salvar
  function salvarSucesso() {
    fecharFormulario();
    atualizarListagem();
  }

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <main className="categorias">
      {/* Cabeçalho da página */}
      <header className="categorias__cabecalho">
        <div>
          <span className="categorias__subtitulo">ORGANIZAÇÃO DO ACERVO</span>

          <h1>Gerenciamento de Categorias</h1>

          <p>
            Organize e gerencie as categorias utilizadas para classificar os
            livros da biblioteca.
          </p>
        </div>

        <button
          type="button"
          className="categorias__botao-nova"
          onClick={abrirCadastro}
        >
          <Plus size={19} />
          Nova categoria
        </button>
      </header>

      {/* Indicadores */}
      <section className="categorias__indicadores">
        <article className="categorias__indicador">
          <div className="categorias__indicador-icone">
            <Layers3 size={22} />
          </div>

          <div>
            <span>Total de categorias</span>
            <strong>{totalCategorias}</strong>
          </div>
        </article>

        <article className="categorias__indicador">
          <div className="categorias__indicador-icone">
            <FileText size={22} />
          </div>

          <div>
            <span>Com descrição</span>
            <strong>{categoriasComDescricao}</strong>
          </div>
        </article>

        <article className="categorias__indicador">
          <div className="categorias__indicador-icone">
            <FileX size={22} />
          </div>

          <div>
            <span>Sem descrição</span>
            <strong>{categoriasSemDescricao}</strong>
          </div>
        </article>
      </section>

      {/* Área de conteúdo */}
      <section className="categorias__conteudo">
        <div className="categorias__conteudo-cabecalho">
          <div>
            <h2>Categorias cadastradas</h2>
            <p>Consulte e gerencie as categorias do acervo.</p>
          </div>
        </div>

        {/* Pesquisa */}
        <div className="categorias__pesquisa">
          <Search size={19} />

          <input
            type="text"
            placeholder="Pesquisar por nome ou descrição..."
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
          />
        </div>

        {/* Carregamento */}
        {carregando && (
          <div className="categorias__estado">
            <p>Carregando categorias...</p>
          </div>
        )}

        {/* Erro */}
        {!carregando && erro && (
          <div className="categorias__erro">
            <p>{erro}</p>

            <button type="button" onClick={atualizarListagem}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Tabela */}
        {!carregando && !erro && (
          <CategoriaTabela
            categorias={categoriasFiltradas}
            onEditar={abrirEdicao}
          />
        )}

        {/* Resultado da pesquisa */}
        {!carregando && !erro && pesquisa && (
          <div className="categorias__resultado">
            Exibindo {categoriasFiltradas.length} de {totalCategorias}{" "}
            categorias.
          </div>
        )}
      </section>

      {/* Formulário */}
      {formularioAberto && (
        <CategoriaFormulario
          categoria={categoriaSelecionada}
          onFechar={fecharFormulario}
          onSucesso={salvarSucesso}
        />
      )}
    </main>
  );
}
