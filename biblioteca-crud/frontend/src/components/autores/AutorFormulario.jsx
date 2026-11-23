import { useEffect, useState } from "react";
import { X, Save, UserRound } from "lucide-react";
import { cadastrarAutor, atualizarAutor } from "../../services/autores.service";
import "../../styles/autor-formulario.css";

/*
|--------------------------------------------------------------------------
| FORMULÁRIO DE AUTORES
|--------------------------------------------------------------------------
|
| Responsabilidades:
| - Cadastrar novos autores.
| - Editar autores existentes.
| - Validar os campos antes do envio.
| - Exibir erros retornados pela API.
|
| Props:
| - autor: objeto do autor que será editado.
| - onFechar: função para fechar o formulário.
| - onSucesso: função executada após salvar com sucesso.
|
*/

export default function AutorFormulario({ autor = null, onFechar, onSucesso }) {
  // Verifica se estamos editando ou cadastrando
  const modoEdicao = Boolean(autor);

  // Estados dos campos
  const [nome, setNome] = useState(autor?.nome ?? "");
  const [biografia, setBiografia] = useState(autor?.biografia ?? "");

  // Estados de controle
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  /*
    |--------------------------------------------------------------------------
    | Atualizar os campos quando o autor selecionado mudar
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    setNome(autor?.nome ?? "");
    setBiografia(autor?.biografia ?? "");
    setErro("");
  }, [autor]);

  /*
    |--------------------------------------------------------------------------
    | Enviar formulário
    |--------------------------------------------------------------------------
    */

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    // Validação básica
    if (!nome.trim()) {
      setErro("O nome do autor é obrigatório.");
      return;
    }

    const dadosAutor = {
      nome: nome.trim(),
      biografia: biografia.trim() || null,
    };

    try {
      setCarregando(true);

      if (modoEdicao) {
        // Atualizar autor existente
        await atualizarAutor(autor.id, dadosAutor);
      } else {
        // Cadastrar novo autor
        await cadastrarAutor(dadosAutor);
      }

      // Avisa a página que a operação foi concluída
      onSucesso();
    } catch (error) {
      console.error("Erro ao salvar autor:", error);

      setErro(
        error.response?.data?.erro ||
          "Não foi possível salvar o autor. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="autor-formulario__overlay">
      <section
        className="autor-formulario"
        role="dialog"
        aria-modal="true"
        aria-labelledby="autor-formulario-titulo"
      >
        {/* Cabeçalho */}
        <div className="autor-formulario__cabecalho">
          <div className="autor-formulario__titulo">
            <div className="autor-formulario__icone">
              <UserRound size={22} />
            </div>

            <div>
              <h2 id="autor-formulario-titulo">
                {modoEdicao ? "Editar autor" : "Novo autor"}
              </h2>

              <p>
                {modoEdicao
                  ? "Atualize as informações do autor."
                  : "Preencha as informações para cadastrar um autor."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="autor-formulario__fechar"
            onClick={onFechar}
            disabled={carregando}
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="autor-formulario__campos">
            {/* Nome */}
            <div className="autor-formulario__campo">
              <label htmlFor="nome">
                Nome do autor
                <span>*</span>
              </label>

              <input
                id="nome"
                type="text"
                placeholder="Ex.: J. R. R. Tolkien"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                maxLength={150}
                required
                autoFocus
                disabled={carregando}
              />
            </div>

            {/* Biografia */}
            <div className="autor-formulario__campo">
              <label htmlFor="biografia">
                Biografia
                <small>Opcional</small>
              </label>

              <textarea
                id="biografia"
                placeholder="Escreva uma breve biografia do autor..."
                value={biografia}
                onChange={(event) => setBiografia(event.target.value)}
                rows={5}
                maxLength={2000}
                disabled={carregando}
              />

              <span className="autor-formulario__contador">
                {biografia.length}/2000 caracteres
              </span>
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && <div className="autor-formulario__erro">{erro}</div>}

          {/* Ações */}
          <div className="autor-formulario__acoes">
            <button
              type="button"
              className="autor-formulario__botao-cancelar"
              onClick={onFechar}
              disabled={carregando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="autor-formulario__botao-salvar"
              disabled={carregando}
            >
              <Save size={17} />

              {carregando
                ? "Salvando..."
                : modoEdicao
                  ? "Salvar alterações"
                  : "Cadastrar autor"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
