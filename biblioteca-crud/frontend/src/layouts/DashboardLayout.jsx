import { useState } from "react";

import { Bell, Menu, Search } from "lucide-react";

import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import "../styles/dashboard-layout.css";

/*
|--------------------------------------------------------------------------
| TÍTULOS DAS PÁGINAS
|--------------------------------------------------------------------------
*/

const titulosPaginas = {
  "/dashboard": {
    titulo: "Dashboard",
    descricao: "Visão geral da biblioteca.",
  },
  "/livros": {
    titulo: "Livros",
    descricao: "Gerencie o acervo bibliográfico.",
  },
  "/autores": {
    titulo: "Autores",
    descricao: "Gerencie os autores cadastrados.",
  },
  "/categorias": {
    titulo: "Categorias",
    descricao: "Organize os livros por categorias.",
  },
  "/emprestimos": {
    titulo: "Empréstimos",
    descricao: "Gerencie empréstimos e devoluções.",
  },
  "/usuarios": {
    titulo: "Usuários",
    descricao: "Gerencie os usuários do sistema.",
  },
};

/*
|--------------------------------------------------------------------------
| DASHBOARD LAYOUT
|--------------------------------------------------------------------------
*/

export default function DashboardLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const location = useLocation();

  const paginaAtual = titulosPaginas[location.pathname] ?? {
    titulo: "Biblioteca",
    descricao: "Sistema de gerenciamento bibliotecário.",
  };

  function fecharSidebar() {
    setSidebarAberta(false);
  }

  function alternarSidebar() {
    setSidebarAberta((estadoAtual) => !estadoAtual);
  }

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar onClose={fecharSidebar} />

      {/* OVERLAY MOBILE */}
      {sidebarAberta && (
        <button
          className="dashboard-layout__overlay"
          type="button"
          aria-label="Fechar menu lateral"
          onClick={fecharSidebar}
        />
      )}

      {/* ÁREA PRINCIPAL */}
      <div className="dashboard-layout__principal">
        {/* HEADER */}
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__header-esquerda">
            <button
              type="button"
              className="dashboard-layout__menu"
              onClick={alternarSidebar}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>

            <div className="dashboard-layout__titulo">
              <h2>{paginaAtual.titulo}</h2>

              <p>{paginaAtual.descricao}</p>
            </div>
          </div>

          <div className="dashboard-layout__header-direita">
            {/* PESQUISA VISUAL */}
            <button
              type="button"
              className="dashboard-layout__pesquisa"
              aria-label="Pesquisar"
            >
              <Search size={19} />
            </button>

            {/* NOTIFICAÇÕES VISUAL */}
            <button
              type="button"
              className="dashboard-layout__notificacao"
              aria-label="Notificações"
            >
              <Bell size={19} />
              <span className="dashboard-layout__notificacao-indicador" />
            </button>

            {/* PERFIL */}
            <div className="dashboard-layout__usuario">
              <div className="dashboard-layout__usuario-avatar">L</div>

              <div className="dashboard-layout__usuario-info">
                <strong>Administrador</strong>
                <span>Biblioteca</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="dashboard-layout__conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
