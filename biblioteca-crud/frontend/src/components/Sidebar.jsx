import {
  LayoutDashboard,
  BookOpen,
  Users,
  Bookmark,
  Repeat,
  UserRound,
  Library,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
| Componente responsável pela navegação lateral da aplicação.
| Recebe onClose para permitir fechar o menu no mobile.
|--------------------------------------------------------------------------
*/

const itensNavegacao = [
  {
    nome: "Dashboard",
    caminho: "/dashboard",
    icone: LayoutDashboard,
  },
  {
    nome: "Livros",
    caminho: "/livros",
    icone: BookOpen,
  },
  {
    nome: "Autores",
    caminho: "/autores",
    icone: Users,
  },
  {
    nome: "Categorias",
    caminho: "/categorias",
    icone: Bookmark,
  },
  {
    nome: "Empréstimos",
    caminho: "/emprestimos",
    icone: Repeat,
  },
  {
    nome: "Usuários",
    caminho: "/usuarios",
    icone: UserRound,
  },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar__cabecalho">
        <div className="sidebar__identidade">
          <div className="sidebar__logo">
            <Library size={24} />
          </div>

          <div className="sidebar__marca">
            <h1>Biblioteca</h1>
            <span>GESTÃO BIBLIOTECÁRIA</span>
          </div>
        </div>

        {/* Botão de fechar no mobile */}
        <button
          className="sidebar__fechar"
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="sidebar__navegacao">
        <span className="sidebar__titulo">MENU PRINCIPAL</span>

        <ul className="sidebar__lista">
          {itensNavegacao.map((item) => {
            const Icone = item.icone;

            return (
              <li key={item.caminho}>
                <NavLink
                  to={item.caminho}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? "sidebar__link--ativo" : ""}`
                  }
                >
                  <Icone size={20} />

                  <span>{item.nome}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* RODAPÉ */}
      <div className="sidebar__rodape">
        <div className="sidebar__perfil">
          <div className="sidebar__avatar">
            <UserRound size={20} />
          </div>

          <div className="sidebar__perfil-info">
            <strong>Administrador</strong>
            <span>Gestão do sistema</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__logout"
          onClick={() => {
            // Implementaremos o logout posteriormente.
          }}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
