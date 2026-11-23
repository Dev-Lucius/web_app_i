import { UserRound, Pencil, Trash2 } from "lucide-react";

export default function AutorTabela({ autores, onEditar, onExcluir }) {
  if (autores.length === 0) {
    return (
      <div className="autor-tabela__vazio">
        <UserRound size={32} />

        <h3>Nenhum autor encontrado</h3>

        <p>Não encontramos autores com os critérios informados.</p>
      </div>
    );
  }

  return (
    <div className="autor-tabela__container">
      <table className="autor-tabela">
        <thead>
          <tr>
            <th>Autor</th>
            <th>Biografia</th>
            <th>Identificação</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {autores.map((autor) => (
            <tr key={autor.id}>
              {/* AUTOR */}
              <td>
                <div className="autor-tabela__identidade">
                  <div className="autor-tabela__icone">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <strong>{autor.nome}</strong>
                    <span>ID: {autor.id}</span>
                  </div>
                </div>
              </td>

              {/* BIOGRAFIA */}
              <td>
                <span className="autor-tabela__biografia">
                  {autor.biografia || "Não informada"}
                </span>
              </td>

              {/* IDENTIFICAÇÃO */}
              <td>
                <span className="autor-tabela__identificador">#{autor.id}</span>
              </td>

              {/* AÇÕES */}
              <td>
                <div className="autor-tabela__acoes">
                  {/* EDITAR */}
                  <button
                    type="button"
                    className="autor-tabela__botao-editar"
                    onClick={() => onEditar(autor)}
                    title="Editar autor"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>

                  {/* EXCLUIR */}
                  <button
                    type="button"
                    className="autor-tabela__botao-excluir"
                    onClick={() => onExcluir(autor)}
                    title="Excluir autor"
                  >
                    <Trash2 size={16} />
                    Excluir
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
