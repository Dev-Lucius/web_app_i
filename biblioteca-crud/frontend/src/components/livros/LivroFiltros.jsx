import { Search, SlidersHorizontal } from "lucide-react";

export default function LivroFiltros({
  pesquisa,
  setPesquisa,
  disponibilidade,
  setDisponibilidade,
}) {
  return (
    <div className="livro-filtros">
      {/* PESQUISA */}
      <div className="livro-filtros__pesquisa">
        <Search size={19} />

        <input
          type="text"
          placeholder="Pesquisar por título ou ISBN..."
          value={pesquisa}
          onChange={(evento) => setPesquisa(evento.target.value)}
        />
      </div>

      {/* FILTRO DE DISPONIBILIDADE */}
      <div className="livro-filtros__selecao">
        <SlidersHorizontal size={18} />

        <select
          value={disponibilidade}
          onChange={(evento) => setDisponibilidade(evento.target.value)}
        >
          <option value="TODOS">Todos os livros</option>
          <option value="DISPONIVEL">Disponíveis</option>
          <option value="INDISPONIVEL">Indisponíveis</option>
        </select>
      </div>
    </div>
  );
}
