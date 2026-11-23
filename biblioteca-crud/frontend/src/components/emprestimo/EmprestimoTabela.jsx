import {
  BookOpen,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| FORMATAR DATA
|--------------------------------------------------------------------------
*/

function formatarData(data) {
  if (!data) {
    return "Não informada";
  }

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

/*
|--------------------------------------------------------------------------
| IDENTIFICAR SITUAÇÃO DO EMPRÉSTIMO
|--------------------------------------------------------------------------
*/

function obterSituacao(emprestimo) {
  if (emprestimo.status === "DEVOLVIDO") {
    return {
      texto: "Devolvido",
      classe: "devolvido",
      icone: CheckCircle2,
    };
  }

  const dataPrevista = new Date(emprestimo.dataPrevistaDevolucao);

  const agora = new Date();

  if (dataPrevista < agora) {
    return {
      texto: "Atrasado",
      classe: "atrasado",
      icone: AlertTriangle,
    };
  }

  return {
    texto: "Em andamento",
    classe: "ativo",
    icone: Clock,
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENTE PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function EmprestimoTabela({
  emprestimos,
  onVerDetalhes,
  onRegistrarDevolucao,
  devolvendoId,
}) {
  /*
    |--------------------------------------------------------------------------
    | ESTADO VAZIO
    |--------------------------------------------------------------------------
    */

  if (emprestimos.length === 0) {
    return (
      <div className="emprestimo-tabela__vazio">
        <BookOpen size={36} />

        <h3>Nenhum empréstimo encontrado</h3>

        <p>Não encontramos empréstimos com os critérios informados.</p>
      </div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | TABELA
    |--------------------------------------------------------------------------
    */

  return (
    <div className="emprestimo-tabela__container">
      <table className="emprestimo-tabela">
        <thead>
          <tr>
            <th>Livro</th>
            <th>Usuário</th>
            <th>Data do empréstimo</th>
            <th>Devolução prevista</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {emprestimos.map((emprestimo) => {
            const situacao = obterSituacao(emprestimo);
            const IconeSituacao = situacao.icone;

            const estaAtivo = emprestimo.status === "ATIVO";

            return (
              <tr key={emprestimo.id}>
                {/* LIVRO */}

                <td>
                  <div className="emprestimo-tabela__livro">
                    <div className="emprestimo-tabela__icone">
                      <BookOpen size={20} />
                    </div>

                    <div>
                      <strong>
                        {emprestimo.livro?.titulo || "Livro não encontrado"}
                      </strong>

                      <span>Empréstimo #{emprestimo.id}</span>
                    </div>
                  </div>
                </td>

                {/* USUÁRIO */}

                <td>
                  <div className="emprestimo-tabela__usuario">
                    <strong>
                      {emprestimo.usuario?.nome || "Usuário não encontrado"}
                    </strong>

                    <span>
                      {emprestimo.usuario?.email || "E-mail não informado"}
                    </span>
                  </div>
                </td>

                {/* DATA DO EMPRÉSTIMO */}

                <td>
                  <span className="emprestimo-tabela__data">
                    {formatarData(emprestimo.dataEmprestimo)}
                  </span>
                </td>

                {/* DATA PREVISTA */}

                <td>
                  <span
                    className={`emprestimo-tabela__data ${
                      situacao.classe === "atrasado"
                        ? "emprestimo-tabela__data--atrasada"
                        : ""
                    }`}
                  >
                    {formatarData(emprestimo.dataPrevistaDevolucao)}
                  </span>
                </td>

                {/* SITUAÇÃO */}

                <td>
                  <span
                    className={`emprestimo-tabela__status emprestimo-tabela__status--${situacao.classe}`}
                  >
                    <IconeSituacao size={15} />

                    {situacao.texto}
                  </span>
                </td>

                {/* AÇÕES */}

                <td>
                  <div className="emprestimo-tabela__acoes">
                    <button
                      type="button"
                      className="emprestimo-tabela__botao-detalhes"
                      onClick={() => onVerDetalhes(emprestimo)}
                      title="Visualizar detalhes"
                    >
                      <Eye size={16} />
                      Detalhes
                    </button>

                    {estaAtivo && (
                      <button
                        type="button"
                        className="emprestimo-tabela__botao-devolver"
                        onClick={() => onRegistrarDevolucao(emprestimo.id)}
                        disabled={devolvendoId === emprestimo.id}
                        title="Registrar devolução"
                      >
                        <RotateCcw size={16} />

                        {devolvendoId === emprestimo.id
                          ? "Devolvendo..."
                          : "Devolver"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
