import { Layers3 } from "lucide-react";

export default function CategoriaTabela({ categorias, onEditar }) {
  // Estado vazio
  if (categorias.length === 0) {
    return (
      <div className="categoria-tabela__vazio">
        <Layers3 size={34} />

        <h3>Nenhuma categoria encontrada</h3>

        <p>Não encontramos categorias com os critérios informados.</p>
      </div>
    );
  }

  return (
    <div className="categoria-tabela__container">
      <table className="categoria-tabela">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Identificação</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              {/* Nome da categoria */}
              <td>
                <div className="categoria-tabela__identidade">
                  <div className="categoria-tabela__icone">
                    <Layers3 size={20} />
                  </div>

                  <div>
                    <strong>{categoria.nome}</strong>

                    <span>Categoria #{categoria.id}</span>
                  </div>
                </div>
              </td>

              {/* Descrição */}
              <td>
                <span className="categoria-tabela__descricao">
                  {categoria.descricao || "Não informada"}
                </span>
              </td>

              {/* Identificação */}
              <td>
                <span className="categoria-tabela__identificador">
                  #{categoria.id}
                </span>
              </td>

              {/* Ações */}
              <td>
                <div className="categoria-tabela__acoes">
                  <button
                    type="button"
                    className="categoria-tabela__botao-editar"
                    onClick={() => onEditar(categoria)}
                    title="Editar categoria"
                  >
                    Editar
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
