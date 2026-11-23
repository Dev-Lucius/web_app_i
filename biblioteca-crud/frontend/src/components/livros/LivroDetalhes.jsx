import { useEffect, useState } from "react";
import { X, BookOpen, LoaderCircle } from "lucide-react";
import "../../styles/livro-detalhes.css";
import { buscarLivroPorId } from "../../services/livros.service";

export default function LivroDetalhes({ livro, onFechar }) {
  const [dadosLivro, setDadosLivro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /*
    |--------------------------------------------------------------------------
    | BUSCAR DADOS COMPLETOS DO LIVRO
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    let ativo = true;

    async function carregarDetalhes() {
      try {
        setCarregando(true);
        setErro("");

        const resultado = await buscarLivroPorId(livro.id);

        if (ativo) {
          setDadosLivro(resultado);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do livro:", error);

        if (ativo) {
          setErro(
            error.response?.data?.erro ||
              "Não foi possível carregar os detalhes do livro.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [livro.id]);

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div className="livro-detalhes__overlay">
      <div className="livro-detalhes">
        {/* CABEÇALHO */}
        <div className="livro-detalhes__cabecalho">
          <div>
            <h2>Detalhes do livro</h2>
            <p>Informações do registro bibliográfico.</p>
          </div>

          <button type="button" onClick={onFechar} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO */}
        {carregando ? (
          <div className="livro-detalhes__estado">
            <LoaderCircle size={28} className="livro-detalhes__spinner" />
            <p>Carregando informações...</p>
          </div>
        ) : erro ? (
          <div className="livro-detalhes__erro">{erro}</div>
        ) : (
          dadosLivro && (
            <div className="livro-detalhes__conteudo">
              {/* IDENTIFICAÇÃO */}
              <div className="livro-detalhes__identificacao">
                <div className="livro-detalhes__icone">
                  <BookOpen size={30} />
                </div>

                <div>
                  <h3>{dadosLivro.titulo}</h3>

                  <span
                    className={`livro-status ${
                      dadosLivro.disponivel
                        ? "livro-status--disponivel"
                        : "livro-status--indisponivel"
                    }`}
                  >
                    {dadosLivro.disponivel ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>

              {/* INFORMAÇÕES GERAIS */}
              <div className="livro-detalhes__secao">
                <h3>Informações gerais</h3>

                <div className="livro-detalhes__grade">
                  <div>
                    <span>ID</span>
                    <strong>{dadosLivro.id}</strong>
                  </div>

                  <div>
                    <span>ISBN</span>
                    <strong>{dadosLivro.isbn || "Não informado"}</strong>
                  </div>

                  <div>
                    <span>Ano de publicação</span>
                    <strong>
                      {dadosLivro.anoPublicacao || "Não informado"}
                    </strong>
                  </div>

                  <div>
                    <span>Disponibilidade</span>
                    <strong>
                      {dadosLivro.disponivel ? "Disponível" : "Indisponível"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* AUTORES */}
              <div className="livro-detalhes__secao">
                <h3>Autores</h3>

                {dadosLivro.autores?.length > 0 ? (
                  <ul>
                    {dadosLivro.autores.map((relacao) => (
                      <li key={relacao.autorId}>
                        <strong>{relacao.autor?.nome}</strong>

                        {relacao.autor?.biografia && (
                          <p>{relacao.autor.biografia}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum autor associado.</p>
                )}
              </div>

              {/* CATEGORIAS */}
              <div className="livro-detalhes__secao">
                <h3>Categorias</h3>

                {dadosLivro.categorias?.length > 0 ? (
                  <ul>
                    {dadosLivro.categorias.map((relacao) => (
                      <li key={relacao.categoriaId}>
                        <strong>{relacao.categoria?.nome}</strong>

                        {relacao.categoria?.descricao && (
                          <p>{relacao.categoria.descricao}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhuma categoria associada.</p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
