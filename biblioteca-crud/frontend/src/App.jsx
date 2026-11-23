import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Catalogo from "./pages/Catalogo";
import Autores from "./pages/Autores";
import Categorias from "./pages/Categorias";
import Emprestimos from "./pages/Emprestimo";
import Usuarios from "./pages/Usuarios";

/*
|--------------------------------------------------------------------------
| PÁGINAS TEMPORÁRIAS
|--------------------------------------------------------------------------
*/

function PaginaPlaceholder({ nome }) {
  return (
    <section>
      <h1>{nome}</h1>
      <p>Esta página será implementada posteriormente.</p>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| ROTAS
|--------------------------------------------------------------------------
*/

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/livros" element={<Catalogo />} />

          <Route path="/autores" element={<Autores />} />

          <Route path="/categorias" element={<Categorias />} />

          <Route path="/emprestimos" element={<Emprestimos />} />

          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
