import { useEffect, useState } from "react";

import { X, BookPlus, Pencil, LoaderCircle, AlertCircle } from "lucide-react";

import {
  cadastrarLivro,
  buscarLivroPorId,
  atualizarLivro,
} from "../../services/livros.service";

import { listarAutores } from "../../services/autores.service";
import { listarCategorias } from "../../services/categorias.service";

import "../../styles/livro-formulario.css";

export default function LivroFormulario({ livro = null, onFechar, onSucesso }) {
  const modoEdicao = Boolean(livro);

  // Dados principais do livro
  const [titulo, setTitulo] = useState("");
  const [isbn, setIsbn] = useState("");
  const [anoPublicacao, setAnoPublicacao] = useState("");
  const [disponivel, setDisponivel] = useState(true);

  // Opções disponíveis para os relacionamentos
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // IDs selecionados
  const [autorIds, setAutorIds] = useState([]);
  const [categoriaIds, setCategoriaIds] = useState([]);

  // Estados da interface
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CARREGAR DADOS DO FORMULÁRIO
  |--------------------------------------------------------------------------
  | Busca autores e categorias disponíveis.
  | Se estiver editando, também busca os dados completos do livro.
  */

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregandoDados(true);
        setErro("");

        const [listaAutores, listaCategorias] = await Promise.all([
          listarAutores(),
          listarCategorias(),
        ]);

        setAutores(listaAutores);
        setCategorias(listaCategorias);

        // Se não existir livro selecionado, estamos cadastrando.
        if (!livro) {
          return;
        }

        // Busca o livro com seus relacionamentos.
        const dadosLivro = await buscarLivroPorId(livro.id);

        setTitulo(dadosLivro.titulo ?? "");
        setIsbn(dadosLivro.isbn ?? "");
        setAnoPublicacao(
          dadosLivro.anoPublicacao == null
            ? ""
            : String(dadosLivro.anoPublicacao),
        );
        setDisponivel(dadosLivro.disponivel);

        // Recupera os IDs dos autores associados ao livro.
        setAutorIds(
          dadosLivro.autores?.map((relacao) => relacao.autorId) ?? [],
        );

        // Recupera os IDs das categorias associadas ao livro.
        setCategoriaIds(
          dadosLivro.categorias?.map((relacao) => relacao.categoriaId) ?? [],
        );
      } catch (error) {
        console.error("Erro ao carregar dados do formulário:", error);

        setErro(
          error.response?.data?.erro ||
            "Não foi possível carregar os dados do formulário.",
        );
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [livro]);

  /*
  |--------------------------------------------------------------------------
  | SELECIONAR / DESELECIONAR AUTORES
  |--------------------------------------------------------------------------
  */

  function alternarAutor(id) {
    setAutorIds((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter((autorId) => autorId !== id);
      }

      return [...atuais, id];
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SELECIONAR / DESELECIONAR CATEGORIAS
  |--------------------------------------------------------------------------
  */

  function alternarCategoria(id) {
    setCategoriaIds((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter((categoriaId) => categoriaId !== id);
      }

      return [...atuais, id];
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CADASTRAR OU ATUALIZAR LIVRO
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!titulo.trim()) {
      setErro("O título do livro é obrigatório.");
      return;
    }

    if (anoPublicacao !== "") {
      const ano = Number(anoPublicacao);

      if (!Number.isInteger(ano) || ano < 0) {
        setErro("Informe um ano de publicação válido.");
        return;
      }
    }

    // Dados que serão enviados para a API.
    const dadosLivro = {
      titulo: titulo.trim(),
      isbn: isbn.trim() || null,
      anoPublicacao: anoPublicacao === "" ? null : Number(anoPublicacao),
      disponivel,
      autorIds,
      categoriaIds,
    };

    try {
      setSalvando(true);

      if (modoEdicao) {
        // Atualiza o livro existente.
        await atualizarLivro(livro.id, dadosLivro);
      } else {
        // Cadastra um novo livro.
        await cadastrarLivro(dadosLivro);
      }

      // Avisa o catálogo que a operação foi concluída.
      onSucesso();

      onFechar();
    } catch (error) {
      console.error("Erro ao salvar livro:", error);

      setErro(
        error.response?.data?.erro ||
          `Não foi possível ${modoEdicao ? "atualizar" : "cadastrar"} o livro.`,
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="livro-formulario__overlay">
      <div
        className="livro-formulario"
        role="dialog"
        aria-modal="true"
        aria-labelledby="livro-formulario-titulo"
      >
        {/* CABEÇALHO */}
        <div className="livro-formulario__cabecalho">
          <div>
            <div className="livro-formulario__titulo-icone">
              {modoEdicao ? <Pencil size={22} /> : <BookPlus size={22} />}
            </div>

            <div>
              <h2 id="livro-formulario-titulo">
                {modoEdicao ? "Editar livro" : "Novo livro"}
              </h2>

              <p>
                {modoEdicao
                  ? "Atualize as informações do livro."
                  : "Preencha os dados para adicionar ao acervo."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="livro-formulario__fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar formulário"
          >
            <X size={21} />
          </button>
        </div>

        {/* CARREGAMENTO INICIAL */}
        {carregandoDados ? (
          <div className="livro-formulario__carregando">
            <LoaderCircle size={25} className="livro-formulario__spinner" />
            <p>Carregando dados do livro...</p>
          </div>
        ) : (
          /* FORMULÁRIO */
          <form className="livro-formulario__corpo" onSubmit={handleSubmit}>
            {erro && (
              <div className="livro-formulario__erro">
                <AlertCircle size={18} />
                <span>{erro}</span>
              </div>
            )}

            {/* DADOS PRINCIPAIS */}
            <div className="livro-formulario__secao">
              <h3>Informações do livro</h3>

              <div className="livro-formulario__campo">
                <label htmlFor="titulo">
                  Título <span>*</span>
                </label>

                <input
                  id="titulo"
                  type="text"
                  placeholder="Ex.: O Hobbit"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="livro-formulario__linha">
                <div className="livro-formulario__campo">
                  <label htmlFor="isbn">ISBN</label>

                  <input
                    id="isbn"
                    type="text"
                    placeholder="Ex.: 9788595084742"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                </div>

                <div className="livro-formulario__campo">
                  <label htmlFor="anoPublicacao">Ano de publicação</label>

                  <input
                    id="anoPublicacao"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex.: 1937"
                    value={anoPublicacao}
                    onChange={(e) => setAnoPublicacao(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AUTORES */}
            <div className="livro-formulario__secao">
              <div className="livro-formulario__secao-cabecalho">
                <h3>Autores</h3>

                <span>{autorIds.length} selecionado(s)</span>
              </div>

              {autores.length === 0 ? (
                <p className="livro-formulario__vazio">
                  Nenhum autor cadastrado. Cadastre autores antes de associá-los
                  ao livro.
                </p>
              ) : (
                <div className="livro-formulario__opcoes">
                  {autores.map((autor) => (
                    <label key={autor.id} className="livro-formulario__opcao">
                      <input
                        type="checkbox"
                        checked={autorIds.includes(autor.id)}
                        onChange={() => alternarAutor(autor.id)}
                      />

                      <span>{autor.nome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CATEGORIAS */}
            <div className="livro-formulario__secao">
              <div className="livro-formulario__secao-cabecalho">
                <h3>Categorias</h3>

                <span>{categoriaIds.length} selecionada(s)</span>
              </div>

              {categorias.length === 0 ? (
                <p className="livro-formulario__vazio">
                  Nenhuma categoria cadastrada. Cadastre categorias antes de
                  associá-las ao livro.
                </p>
              ) : (
                <div className="livro-formulario__opcoes">
                  {categorias.map((categoria) => (
                    <label
                      key={categoria.id}
                      className="livro-formulario__opcao"
                    >
                      <input
                        type="checkbox"
                        checked={categoriaIds.includes(categoria.id)}
                        onChange={() => alternarCategoria(categoria.id)}
                      />

                      <span>{categoria.nome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* DISPONIBILIDADE */}
            <div className="livro-formulario__secao">
              <h3>Disponibilidade</h3>

              <label className="livro-formulario__disponibilidade">
                <input
                  type="checkbox"
                  checked={disponivel}
                  onChange={(e) => setDisponivel(e.target.checked)}
                />

                <span>Disponível para empréstimo</span>
              </label>
            </div>

            {/* RODAPÉ */}
            <div className="livro-formulario__rodape">
              <button
                type="button"
                className="livro-formulario__botao-cancelar"
                onClick={onFechar}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="livro-formulario__botao-salvar"
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="livro-formulario__spinner"
                    />
                    Salvando...
                  </>
                ) : modoEdicao ? (
                  <>
                    <Pencil size={17} />
                    Salvar alterações
                  </>
                ) : (
                  <>
                    <BookPlus size={17} />
                    Cadastrar livro
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
