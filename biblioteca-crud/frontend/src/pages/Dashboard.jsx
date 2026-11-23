import { useEffect, useState } from "react";

import { BookOpen, Users, Repeat, AlertCircle } from "lucide-react";

import StatCard from "../components/dashboard/StatCard";

import { buscarDadosDashboard } from "../services/dashboard.service";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [dados, setDados] = useState(null);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  /*
    |--------------------------------------------------------------------------
    | CARREGAR DADOS
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro("");

        const resultado = await buscarDadosDashboard();

        setDados(resultado);
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);

        setErro(
          error.response?.data?.erro || "Não foi possível carregar os dados.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  /*
    |--------------------------------------------------------------------------
    | ESTADO DE CARREGAMENTO
    |--------------------------------------------------------------------------
    */

  if (carregando) {
    return (
      <div className="dashboard__estado">
        Carregando informações do Dashboard...
      </div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | ESTADO DE ERRO
    |--------------------------------------------------------------------------
    */

  if (erro) {
    return (
      <div className="dashboard__estado dashboard__estado--erro">{erro}</div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | ESTATÍSTICAS
    |--------------------------------------------------------------------------
    */

  const estatisticas = dados.estatisticas;

  return (
    <section className="dashboard">
      {/* APRESENTAÇÃO */}
      <div className="dashboard__apresentacao">
        <div>
          <h1>Visão geral</h1>

          <p>Acompanhe os principais indicadores da biblioteca.</p>
        </div>
      </div>

      {/* INDICADORES */}
      <div className="dashboard__estatisticas">
        <StatCard
          titulo="Livros cadastrados"
          valor={estatisticas.totalLivros}
          descricao="Total do acervo"
          icone={BookOpen}
        />

        <StatCard
          titulo="Usuários cadastrados"
          valor={estatisticas.totalUsuarios}
          descricao="Usuários registrados"
          icone={Users}
        />

        <StatCard
          titulo="Empréstimos ativos"
          valor={estatisticas.emprestimosAtivos}
          descricao="Em andamento"
          icone={Repeat}
        />

        <StatCard
          titulo="Empréstimos atrasados"
          valor={estatisticas.emprestimosAtrasados}
          descricao="Precisam de atenção"
          icone={AlertCircle}
          variante="alerta"
        />
      </div>

      {/* CONTEÚDO INFERIOR */}
      <div className="dashboard__conteudo">
        <div className="dashboard__painel">
          <h2>Empréstimos recentes</h2>

          {dados.emprestimosRecentes.length === 0 ? (
            <p>Nenhum empréstimo registrado.</p>
          ) : (
            <ul>
              {dados.emprestimosRecentes.map((emprestimo) => (
                <li key={emprestimo.id}>
                  <strong>{emprestimo.livro.titulo}</strong>
                  <span>{emprestimo.usuario.nome}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard__painel">
          <h2>Livros populares</h2>

          {dados.livrosPopulares.length === 0 ? (
            <p>Nenhum livro emprestado ainda.</p>
          ) : (
            <ul>
              {dados.livrosPopulares.map((livro) => (
                <li key={livro.id}>
                  <strong>{livro.titulo}</strong>
                  <span>{livro.quantidadeEmprestimos} empréstimos</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
