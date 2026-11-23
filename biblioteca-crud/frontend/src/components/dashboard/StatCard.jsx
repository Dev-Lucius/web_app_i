export default function StatCard({
  titulo,
  valor,
  descricao,
  icone: Icone,
  variante = "padrao",
}) {
  return (
    <article className={`stat-card stat-card--${variante}`}>
      <div className="stat-card__conteudo">
        <span className="stat-card__titulo">{titulo}</span>

        <strong className="stat-card__valor">{valor}</strong>

        <span className="stat-card__descricao">{descricao}</span>
      </div>

      <div className="stat-card__icone">
        <Icone size={22} />
      </div>
    </article>
  );
}
