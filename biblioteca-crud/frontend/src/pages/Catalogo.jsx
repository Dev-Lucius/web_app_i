import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Library, Plus } from "lucide-react";
import { listarLivros } from "../services/livros.service";
import LivroFiltros from "../components/livros/LivroFiltros";
import LivroTabela from "../components/livros/LivroTabela";
import LivroFormulario from "../components/livros/LivroFormulario";
import LivroDetalhes from "../components/livros/LivroDetalhes";
import "../styles/catalogo.css";

export default function Catalogo() {
  const [livros, setLivros] = useState([]);

  const [pesquisa, setPesquisa] = useState("");

  const [disponibilidade, setDisponibilidade] = useState("TODOS");

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  // Controla a abertura do formulário
  const [formularioAberto, setFormularioAberto] = useState(false);

  // Controla a atualização do catálogo
  const [recarregar, setRecarregar] = useState(0);

  // Armazena o livro selecionado para edição
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  // Controla a abertura da visualização
  const [visualizacaoAberta, setVisualizacaoAberta] = useState(false);

  // Armazena o livro selecionado para visualização
  const [livroVisualizado, setLivroVisualizado] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | CARREGAR LIVROS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function carregarLivros() {
      try {
        setCarregando(true);
        setErro("");

        const resultado = await listarLivros();

        const lista = Array.isArray(resultado)
          ? resultado
          : (resultado.livros ?? []);

        setLivros(lista);
      } catch (error) {
        console.error("Erro ao carregar livros:", error);

        setErro(
          error.response?.data?.erro || "Não foi possível carregar o catálogo.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarLivros();
  }, [recarregar]);

  /*
  |--------------------------------------------------------------------------
  | CONTROLE DO FORMULÁRIO
  |--------------------------------------------------------------------------
  */

  // Abrir formulário para cadastrar um novo livro
  function handleNovoLivro() {
    setLivroSelecionado(null);
    setFormularioAberto(true);
  }

  // Abrir formulário para editar um livro existente
  function handleEditarLivro(livro) {
    setLivroSelecionado(livro);
    setFormularioAberto(true);
  }

  // Fechar formulário e limpar a seleção
  function handleFecharFormulario() {
    setFormularioAberto(false);
    setLivroSelecionado(null);
  }

  // Atualizar catálogo após cadastro ou edição
  function handleSalvarSucesso() {
    setFormularioAberto(false);
    setLivroSelecionado(null);

    setRecarregar((atual) => atual + 1);
  }

  // Abrir detalhes de um livro
  function handleVisualizarLivro(livro) {
    setLivroVisualizado(livro);
    setVisualizacaoAberta(true);
  }

  // Fechar detalhes do livro
  function handleFecharDetalhes() {
    setVisualizacaoAberta(false);
    setLivroVisualizado(null);
  }

  /*
  |--------------------------------------------------------------------------
  | FILTRAR LIVROS
  |--------------------------------------------------------------------------
  */

  const livrosFiltrados = useMemo(() => {
    return livros.filter((livro) => {
      const termo = pesquisa.toLowerCase().trim();

      const correspondePesquisa =
        livro.titulo?.toLowerCase().includes(termo) ||
        livro.isbn?.toLowerCase().includes(termo) ||
        false;

      const correspondeDisponibilidade =
        disponibilidade === "TODOS" ||
        (disponibilidade === "DISPONIVEL" && livro.disponivel) ||
        (disponibilidade === "INDISPONIVEL" && !livro.disponivel);

      return correspondePesquisa && correspondeDisponibilidade;
    });
  }, [livros, pesquisa, disponibilidade]);

  /*
  |--------------------------------------------------------------------------
  | INDICADORES
  |--------------------------------------------------------------------------
  */

  const totalLivros = livros.length;

  const livrosDisponiveis = livros.filter((livro) => livro.disponivel).length;

  const livrosIndisponiveis = totalLivros - livrosDisponiveis;

  /*
  |--------------------------------------------------------------------------
  | RENDERIZAÇÃO
  |--------------------------------------------------------------------------
  */

  return (
    <section className="catalogo">
      {/* CABEÇALHO */}
      <div className="catalogo__cabecalho">
        <div>
          <h1>Catálogo de livros</h1>

          <p>Consulte e gerencie os livros disponíveis na biblioteca.</p>
        </div>

        <button
          type="button"
          className="catalogo__botao"
          onClick={handleNovoLivro}
        >
          <Plus size={19} />
          Novo livro
        </button>
      </div>

      {/* INDICADORES */}
      <div className="catalogo__indicadores">
        <div className="catalogo__indicador">
          <div className="catalogo__indicador-icone">
            <Library size={21} />
          </div>

          <div>
            <span>Total de livros</span>
            <strong>{totalLivros}</strong>
          </div>
        </div>

        <div className="catalogo__indicador">
          <div className="catalogo__indicador-icone catalogo__indicador-icone--sucesso">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Disponíveis</span>
            <strong>{livrosDisponiveis}</strong>
          </div>
        </div>

        <div className="catalogo__indicador">
          <div className="catalogo__indicador-icone catalogo__indicador-icone--alerta">
            <BookOpen size={21} />
          </div>

          <div>
            <span>Indisponíveis</span>
            <strong>{livrosIndisponiveis}</strong>
          </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="catalogo__conteudo">
        <div className="catalogo__conteudo-cabecalho">
          <div>
            <h2>Acervo bibliográfico</h2>

            <p>{livrosFiltrados.length} livro(s) encontrado(s)</p>
          </div>
        </div>

        <LivroFiltros
          pesquisa={pesquisa}
          setPesquisa={setPesquisa}
          disponibilidade={disponibilidade}
          setDisponibilidade={setDisponibilidade}
        />

        {carregando ? (
          <div className="catalogo__estado">Carregando livros...</div>
        ) : erro ? (
          <div className="catalogo__estado catalogo__estado--erro">{erro}</div>
        ) : (
          <LivroTabela
            livros={livrosFiltrados}
            onEditar={handleEditarLivro}
            onVisualizar={handleVisualizarLivro}
          />
        )}
      </div>

      {/* FORMULÁRIO DE CADASTRO E EDIÇÃO */}
      {formularioAberto && (
        <LivroFormulario
          livro={livroSelecionado}
          onFechar={handleFecharFormulario}
          onSucesso={handleSalvarSucesso}
        />
      )}
      {/* VISUALIZAÇÃO DOS DETALHES DO LIVRO */}
      {visualizacaoAberta && livroVisualizado && (
        <LivroDetalhes
          livro={livroVisualizado}
          onFechar={handleFecharDetalhes}
        />
      )}
    </section>
  );
}
