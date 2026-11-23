import { Eye, Pencil, Trash2, Users, Mail, CalendarDays } from "lucide-react";

/*
|--------------------------------------------------------------------------
| COMPONENTE: USUARIO TABELA
|--------------------------------------------------------------------------
|
| Responsável por:
|
| - Exibir os usuários cadastrados;
| - Mostrar informações relevantes de cada leitor;
| - Permitir visualizar os detalhes;
| - Permitir editar um usuário;
| - Permitir solicitar a exclusão.
|
| A lógica de requisições HTTP fica fora deste componente.
| As ações são executadas através de callbacks recebidos via props.
|
|--------------------------------------------------------------------------
*/

// Formatar data para o padrão brasileiro
function formatarData(data) {
  // Caso não exista uma data cadastrada
  if (!data) {
    return "Não informado";
  }

  // Converte a data para o formato brasileiro
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Determinar a quantidade de empréstimos de um usuário
function obterQuantidadeEmprestimos(usuario) {
  // Caso a API retorne a relação de empréstimos
  if (Array.isArray(usuario.emprestimos)) {
    return usuario.emprestimos.length;
  }

  // Caso a API retorne o contador do Prisma
  if (usuario._count?.emprestimos !== undefined) {
    return usuario._count.emprestimos;
  }

  // Caso nenhuma dessas informações esteja disponível
  return 0;
}

// Componente principal
export default function UsuarioTabela({
  usuarios,
  onVerDetalhes,
  onEditar,
  onExcluir,
}) {
  /*
    |--------------------------------------------------------------------------
    | ESTADO DE EXIBIÇÃO
    |--------------------------------------------------------------------------
    |
    | Este componente não possui estados próprios de negócio.
    | Os dados e as funções são recebidos da página Usuarios.jsx.
    |
    |--------------------------------------------------------------------------
    */

  // Caso não existam usuários cadastrados
  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="usuarios-tabela__vazio">
        <div className="usuarios-tabela__vazio-icone">
          <Users size={36} />
        </div>

        <h3>Nenhum leitor encontrado</h3>

        <p>
          Não existem usuários cadastrados ou nenhum resultado corresponde à
          pesquisa realizada.
        </p>
      </div>
    );
  }

  // Renderização da tabela
  return (
    <div className="usuarios-tabela__container">
      <table className="usuarios-tabela">
        {/* Cabeçalho */}
        <thead>
          <tr>
            <th>Leitor</th>
            <th>E-mail</th>
            <th>Cadastro</th>
            <th>Empréstimos</th>
            <th>Ações</th>
          </tr>
        </thead>

        {/* Corpo da tabela */}
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              {/* Nome e identificação */}
              <td>
                <div className="usuarios-tabela__leitor">
                  <div className="usuarios-tabela__avatar">
                    <Users size={18} />
                  </div>

                  <div className="usuarios-tabela__identidade">
                    <span className="usuarios-tabela__nome">
                      {usuario.nome}
                    </span>

                    <span className="usuarios-tabela__id">
                      ID: #{usuario.id}
                    </span>
                  </div>
                </div>
              </td>

              {/* E-mail */}
              <td>
                <div className="usuarios-tabela__email">
                  <Mail size={15} />

                  <span>{usuario.email}</span>
                </div>
              </td>

              {/* Data de cadastro */}
              <td>
                <div className="usuarios-tabela__data">
                  <CalendarDays size={15} />

                  <span>{formatarData(usuario.createdAt)}</span>
                </div>
              </td>

              {/* Quantidade de empréstimos */}
              <td>
                <span className="usuarios-tabela__emprestimos">
                  {obterQuantidadeEmprestimos(usuario)}
                </span>
              </td>

              {/* Ações */}
              <td>
                <div className="usuarios-tabela__acoes">
                  {/* Visualizar detalhes */}
                  <button
                    type="button"
                    className="usuarios-tabela__botao usuarios-tabela__botao--detalhes"
                    onClick={() => onVerDetalhes(usuario)}
                    title="Visualizar detalhes"
                    aria-label={`Visualizar ${usuario.nome}`}
                  >
                    <Eye size={17} />
                  </button>

                  {/* Editar */}
                  <button
                    type="button"
                    className="usuarios-tabela__botao usuarios-tabela__botao--editar"
                    onClick={() => onEditar(usuario)}
                    title="Editar usuário"
                    aria-label={`Editar ${usuario.nome}`}
                  >
                    <Pencil size={17} />
                  </button>

                  {/* Excluir */}
                  <button
                    type="button"
                    className="usuarios-tabela__botao usuarios-tabela__botao--excluir"
                    onClick={() => onExcluir(usuario)}
                    title="Excluir usuário"
                    aria-label={`Excluir ${usuario.nome}`}
                  >
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
