import {
  X,
  UserRound,
  Mail,
  CalendarDays,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  BookMarked,
} from "lucide-react";

import "../../styles/usuario-detalhes.css";

/*
|--------------------------------------------------------------------------
| COMPONENTE: USUARIO DETALHES
|--------------------------------------------------------------------------
|
| Responsável por:
|
| - Exibir os dados cadastrais de um leitor;
| - Exibir a data de cadastro;
| - Exibir o total de empréstimos;
| - Exibir o histórico de empréstimos;
| - Identificar empréstimos ativos, atrasados e devolvidos;
| - Permitir fechar o modal.
|
| Este componente não realiza requisições HTTP.
| Os dados são recebidos através da prop usuario.
|
|--------------------------------------------------------------------------
*/

// Formatar datas para o padrão brasileiro
function formatarData(data) {
  if (!data) {
    return "Não informado";
  }

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Determinar a situação do empréstimo
function obterSituacao(emprestimo) {
  // Empréstimo devolvido
  if (emprestimo.status === "DEVOLVIDO") {
    return {
      texto: "Devolvido",
      classe: "devolvido",
      icone: CheckCircle2,
    };
  }

  // Empréstimo ativo
  if (emprestimo.status === "ATIVO") {
    const dataPrevista = new Date(emprestimo.dataPrevistaDevolucao);

    // Comparação com o dia atual
    const hoje = new Date();

    // Normalizar a comparação para as datas
    hoje.setHours(0, 0, 0, 0);
    dataPrevista.setHours(0, 0, 0, 0);

    // Empréstimo atrasado
    if (dataPrevista < hoje) {
      return {
        texto: "Atrasado",
        classe: "atrasado",
        icone: AlertTriangle,
      };
    }

    // Empréstimo ainda dentro do prazo
    return {
      texto: "Em andamento",
      classe: "ativo",
      icone: Clock,
    };
  }

  // Situação desconhecida
  return {
    texto: emprestimo.status || "Indefinido",
    classe: "indefinido",
    icone: Clock,
  };
}

// Ordenar histórico por data de empréstimo
function ordenarEmprestimos(emprestimos) {
  if (!Array.isArray(emprestimos)) {
    return [];
  }

  return [...emprestimos].sort((a, b) => {
    return new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo);
  });
}

// Componente principal
export default function UsuarioDetalhes({ usuario, onClose }) {
  /*
    |--------------------------------------------------------------------------
    | PROTEÇÃO CONTRA DADOS INEXISTENTES
    |--------------------------------------------------------------------------
    */

  // Caso nenhum usuário tenha sido informado
  if (!usuario) {
    return null;
  }

  /*
    |--------------------------------------------------------------------------
    | HISTÓRICO DE EMPRÉSTIMOS
    |--------------------------------------------------------------------------
    */

  // Obtém os empréstimos do usuário
  const emprestimos = ordenarEmprestimos(usuario.emprestimos);

  // Quantidade total de empréstimos
  const totalEmprestimos = emprestimos.length;

  // Quantidade de empréstimos ativos
  const emprestimosAtivos = emprestimos.filter(
    (emprestimo) => emprestimo.status === "ATIVO",
  ).length;

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div
      className="usuario-detalhes__overlay"
      onMouseDown={(event) => {
        // Fecha somente ao clicar no fundo
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal */}
      <div className="usuario-detalhes__modal">
        {/* Cabeçalho */}
        <header className="usuario-detalhes__header">
          <div className="usuario-detalhes__header-info">
            <div className="usuario-detalhes__avatar">
              <UserRound size={28} />
            </div>

            <div>
              <h2>Detalhes do leitor</h2>

              <p>Informações cadastrais e histórico.</p>
            </div>
          </div>

          {/* Botão fechar */}
          <button
            type="button"
            className="usuario-detalhes__fechar"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </header>

        {/* Conteúdo */}
        <div className="usuario-detalhes__conteudo">
          {/* Informações cadastrais */}
          <section className="usuario-detalhes__perfil">
            <div className="usuario-detalhes__perfil-titulo">
              <UserRound size={18} />

              <h3>Informações cadastrais</h3>
            </div>

            {/* Nome */}
            <div className="usuario-detalhes__informacao">
              <span className="usuario-detalhes__label">Nome completo</span>

              <strong className="usuario-detalhes__valor">
                {usuario.nome || "Não informado"}
              </strong>
            </div>

            {/* E-mail */}
            <div className="usuario-detalhes__informacao">
              <span className="usuario-detalhes__label">E-mail</span>

              <div className="usuario-detalhes__email">
                <Mail size={16} />

                <strong className="usuario-detalhes__valor">
                  {usuario.email || "Não informado"}
                </strong>
              </div>
            </div>

            {/* Identificação */}
            <div className="usuario-detalhes__informacao">
              <span className="usuario-detalhes__label">Identificação</span>

              <strong className="usuario-detalhes__valor">#{usuario.id}</strong>
            </div>

            {/* Data de cadastro */}
            <div className="usuario-detalhes__informacao">
              <span className="usuario-detalhes__label">Data de cadastro</span>

              <div className="usuario-detalhes__data">
                <CalendarDays size={16} />

                <strong className="usuario-detalhes__valor">
                  {formatarData(usuario.createdAt)}
                </strong>
              </div>
            </div>
          </section>

          {/* Resumo dos empréstimos */}
          <section className="usuario-detalhes__resumo">
            <div className="usuario-detalhes__resumo-card">
              <div className="usuario-detalhes__resumo-icone">
                <BookOpen size={20} />
              </div>

              <div>
                <span>Total de empréstimos</span>

                <strong>{totalEmprestimos}</strong>
              </div>
            </div>

            <div className="usuario-detalhes__resumo-card">
              <div className="usuario-detalhes__resumo-icone usuario-detalhes__resumo-icone--ativo">
                <Clock size={20} />
              </div>

              <div>
                <span>Em andamento</span>

                <strong>{emprestimosAtivos}</strong>
              </div>
            </div>
          </section>

          {/* Histórico */}
          <section className="usuario-detalhes__historico">
            <div className="usuario-detalhes__historico-titulo">
              <div className="usuario-detalhes__historico-heading">
                <History size={19} />

                <h3>Histórico de empréstimos</h3>
              </div>

              <span className="usuario-detalhes__historico-contagem">
                {totalEmprestimos}
              </span>
            </div>

            {/* Caso não existam empréstimos */}
            {emprestimos.length === 0 ? (
              <div className="usuario-detalhes__historico-vazio">
                <div className="usuario-detalhes__historico-vazio-icone">
                  <BookMarked size={28} />
                </div>

                <h4>Nenhum empréstimo registrado</h4>

                <p>
                  Este leitor ainda não possui empréstimos registrados na
                  biblioteca.
                </p>
              </div>
            ) : (
              /* Lista de empréstimos */
              <div className="usuario-detalhes__lista">
                {emprestimos.map((emprestimo) => {
                  // Obtém a situação
                  const situacao = obterSituacao(emprestimo);

                  // Ícone da situação
                  const IconeSituacao = situacao.icone;

                  return (
                    <article
                      className="usuario-detalhes__emprestimo"
                      key={emprestimo.id}
                    >
                      {/* Livro */}
                      <div className="usuario-detalhes__livro">
                        <div className="usuario-detalhes__livro-icone">
                          <BookOpen size={20} />
                        </div>

                        <div className="usuario-detalhes__livro-info">
                          <h4>
                            {emprestimo.livro?.titulo ||
                              "Livro não identificado"}
                          </h4>

                          <span>Empréstimo #{emprestimo.id}</span>
                        </div>
                      </div>

                      {/* Datas */}
                      <div className="usuario-detalhes__datas">
                        <div>
                          <span>Retirada</span>

                          <strong>
                            {formatarData(emprestimo.dataEmprestimo)}
                          </strong>
                        </div>

                        <div>
                          <span>Devolução prevista</span>

                          <strong>
                            {formatarData(emprestimo.dataPrevistaDevolucao)}
                          </strong>
                        </div>

                        {emprestimo.dataDevolucao && (
                          <div>
                            <span>Devolução realizada</span>

                            <strong>
                              {formatarData(emprestimo.dataDevolucao)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Situação */}
                      <div className="usuario-detalhes__situacao">
                        <span
                          className={`usuario-detalhes__status usuario-detalhes__status--${situacao.classe}`}
                        >
                          <IconeSituacao size={15} />

                          {situacao.texto}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Rodapé */}
        <footer className="usuario-detalhes__footer">
          <button
            type="button"
            className="usuario-detalhes__botao-fechar"
            onClick={onClose}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
