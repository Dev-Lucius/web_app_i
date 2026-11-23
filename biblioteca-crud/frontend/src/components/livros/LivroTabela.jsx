import { Eye, Pencil, Trash2 } from "lucide-react";

export default function LivroTabela({ livros, onEditar, onVisualizar }) {
  if (livros.length === 0) {
    return (
      <div className="livro-tabela__vazio">
        <h3>Nenhum livro encontrado</h3>
        <p>Não encontramos livros com os critérios informados.</p>
      </div>
    );
  }

  return (
    <div className="livro-tabela__container">
      <table className="livro-tabela">
        <thead>
          <tr>
            <th>Livro</th>
            <th>ISBN</th>
            <th>Ano</th>
            <th>Disponibilidade</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {livros.map((livro) => (
            <tr key={livro.id}>
              <td>
                <div className="livro-tabela__titulo">
                  <div className="livro-tabela__icone">
                    <span>📖</span>
                  </div>

                  <strong>{livro.titulo}</strong>
                </div>
              </td>

              <td>{livro.isbn || "Não informado"}</td>

              <td>{livro.anoPublicacao || "—"}</td>

              <td>
                <span
                  className={`livro-status ${
                    livro.disponivel
                      ? "livro-status--disponivel"
                      : "livro-status--indisponivel"
                  }`}
                >
                  {livro.disponivel ? "Disponível" : "Indisponível"}
                </span>
              </td>

              <td>
                <div className="livro-tabela__acoes">
                  {/* Visualizar detalhes */}
                  <button
                    type="button"
                    title="Visualizar"
                    onClick={() => onVisualizar(livro)}
                  >
                    <Eye size={17} />
                  </button>

                  {/* Editar livro */}
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => onEditar(livro)}
                  >
                    <Pencil size={17} />
                  </button>

                  {/* Excluir livro - implementaremos depois */}
                  <button type="button" title="Excluir" disabled>
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
