import {
  X,
  BookOpen,
  UserRound,
  CalendarDays,
  Hash,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| FUNÇÕES AUXILIARES
|--------------------------------------------------------------------------
*/

// Formata datas para o padrão brasileiro.
function formatarData(data) {
  if (!data) return "Não informada";

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Verifica a situação atual do empréstimo.
function obterSituacao(emprestimo) {
  if (emprestimo.status === "DEVOLVIDO") {
    return {
      label: "Devolvido",
      classe: "devolvido",
      icone: CheckCircle2,
      descricao: "Este empréstimo foi finalizado.",
    };
  }

  const dataPrevista = new Date(emprestimo.dataPrevistaDevolucao);

  // Compara apenas as datas, sem considerar o horário.
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  dataPrevista.setHours(0, 0, 0, 0);

  if (dataPrevista < hoje) {
    return {
      label: "Atrasado",
      classe: "atrasado",
      icone: AlertTriangle,
      descricao: "A data prevista de devolução já passou.",
    };
  }

  return {
    label: "Em andamento",
    classe: "ativo",
    icone: Clock,
    descricao: "Este empréstimo ainda está dentro do prazo.",
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENTE: EMPRESTIMODETALHES
|--------------------------------------------------------------------------
*/

export default function EmprestimoDetalhes({ emprestimo, onClose }) {
  // Evita renderização sem um empréstimo selecionado.
  if (!emprestimo) return null;

  const situacao = obterSituacao(emprestimo);
  const IconeSituacao = situacao.icone;

  return (
    <div
      className="emprestimo-detalhes__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="emprestimo-detalhes"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emprestimo-detalhes-titulo"
      >
        {/* Cabeçalho */}
        <header className="emprestimo-detalhes__header">
          <div>
            <span className="emprestimo-detalhes__etiqueta">
              CONSULTA DE REGISTRO
            </span>

            <h2 id="emprestimo-detalhes-titulo">Empréstimo #{emprestimo.id}</h2>

            <p>Informações completas do empréstimo selecionado.</p>
          </div>

          <button
            type="button"
            className="emprestimo-detalhes__fechar"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </header>

        {/* Conteúdo */}
        <div className="emprestimo-detalhes__conteudo">
          {/* Situação */}
          <div
            className={`emprestimo-detalhes__situacao emprestimo-detalhes__situacao--${situacao.classe}`}
          >
            <IconeSituacao size={19} />

            <div>
              <strong>{situacao.label}</strong>
              <p>{situacao.descricao}</p>
            </div>
          </div>

          {/* Livro */}
          <section className="emprestimo-detalhes__secao">
            <h3>
              <BookOpen size={18} />
              Informações do livro
            </h3>

            <div className="emprestimo-detalhes__identificacao">
              <div className="emprestimo-detalhes__icone">
                <BookOpen size={23} />
              </div>

              <div>
                <strong>
                  {emprestimo.livro?.titulo || "Livro não identificado"}
                </strong>

                <span>Livro #{emprestimo.livroId}</span>

                {emprestimo.livro?.isbn && (
                  <span>ISBN: {emprestimo.livro.isbn}</span>
                )}
              </div>
            </div>
          </section>

          {/* Usuário */}
          <section className="emprestimo-detalhes__secao">
            <h3>
              <UserRound size={18} />
              Informações do usuário
            </h3>

            <div className="emprestimo-detalhes__identificacao">
              <div className="emprestimo-detalhes__icone">
                <UserRound size={23} />
              </div>

              <div>
                <strong>
                  {emprestimo.usuario?.nome || "Usuário não identificado"}
                </strong>

                <span>Usuário #{emprestimo.usuarioId}</span>

                {emprestimo.usuario?.email && (
                  <span>{emprestimo.usuario.email}</span>
                )}
              </div>
            </div>
          </section>

          {/* Datas */}
          <section className="emprestimo-detalhes__secao">
            <h3>
              <CalendarDays size={18} />
              Histórico de datas
            </h3>

            <div className="emprestimo-detalhes__datas">
              <div className="emprestimo-detalhes__data">
                <span>Data do empréstimo</span>

                <strong>{formatarData(emprestimo.dataEmprestimo)}</strong>
              </div>

              <div className="emprestimo-detalhes__data">
                <span>Devolução prevista</span>

                <strong>
                  {formatarData(emprestimo.dataPrevistaDevolucao)}
                </strong>
              </div>

              <div className="emprestimo-detalhes__data">
                <span>Devolução realizada</span>

                <strong
                  className={
                    emprestimo.dataDevolucao
                      ? "emprestimo-detalhes__data--concluida"
                      : "emprestimo-detalhes__data--pendente"
                  }
                >
                  {emprestimo.dataDevolucao
                    ? formatarData(emprestimo.dataDevolucao)
                    : "Ainda não realizada"}
                </strong>
              </div>
            </div>
          </section>

          {/* Identificação do registro */}
          <section className="emprestimo-detalhes__registro">
            <div>
              <Hash size={17} />

              <span>Identificação do empréstimo</span>
            </div>

            <strong>#{emprestimo.id}</strong>
          </section>

          {/* Informação final */}
          <div className="emprestimo-detalhes__informacao">
            <Info size={18} />

            <p>
              {emprestimo.status === "DEVOLVIDO"
                ? "Este empréstimo já foi finalizado e a devolução foi registrada no sistema."
                : "Para registrar a devolução deste livro, utilize a ação correspondente na tabela de empréstimos."}
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="emprestimo-detalhes__footer">
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </section>
    </div>
  );
}
