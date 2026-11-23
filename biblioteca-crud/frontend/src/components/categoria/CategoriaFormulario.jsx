import { useEffect, useState } from "react";

import { X, Layers3, Save } from "lucide-react";

import {
  cadastrarCategoria,
  atualizarCategoria,
} from "../../services/categorias.service";

export default function CategoriaFormulario({
  categoria = null,
  onFechar,
  onSucesso,
}) {
  /*
    |--------------------------------------------------------------------------
    | ESTADOS DO FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Identifica se estamos editando ou cadastrando
  const modoEdicao = Boolean(categoria);

  /*
    |--------------------------------------------------------------------------
    | PREENCHER FORMULÁRIO NA EDIÇÃO
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome || "");
      setDescricao(categoria.descricao || "");
    } else {
      setNome("");
      setDescricao("");
    }
  }, [categoria]);

  /*
    |--------------------------------------------------------------------------
    | VALIDAR FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  function validarFormulario() {
    if (!nome.trim()) {
      setErro("O nome da categoria é obrigatório.");
      return false;
    }

    if (nome.trim().length > 100) {
      setErro("O nome deve possuir no máximo 100 caracteres.");
      return false;
    }

    if (descricao.trim().length > 2000) {
      setErro("A descrição deve possuir no máximo 2000 caracteres.");
      return false;
    }

    return true;
  }

  /*
    |--------------------------------------------------------------------------
    | SALVAR CATEGORIA
    |--------------------------------------------------------------------------
    */

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!validarFormulario()) {
      return;
    }

    try {
      setCarregando(true);

      const dados = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
      };

      if (modoEdicao) {
        await atualizarCategoria(categoria.id, dados);
      } else {
        await cadastrarCategoria(dados);
      }

      // Avisa a página que a operação foi concluída
      onSucesso();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);

      const mensagem =
        error.response?.data?.erro || error.response?.data?.mensagem;

      if (error.response?.status === 409) {
        setErro(mensagem || "Já existe uma categoria com esse nome.");
      } else if (error.response?.status === 400) {
        setErro(mensagem || "Verifique os dados informados.");
      } else {
        setErro(mensagem || "Não foi possível salvar a categoria.");
      }
    } finally {
      setCarregando(false);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <div className="categoria-formulario__overlay">
      <section
        className="categoria-formulario"
        role="dialog"
        aria-modal="true"
        aria-labelledby="categoria-formulario-titulo"
      >
        {/* Cabeçalho */}
        <header className="categoria-formulario__cabecalho">
          <div className="categoria-formulario__titulo">
            <div className="categoria-formulario__icone">
              <Layers3 size={21} />
            </div>

            <div>
              <h2 id="categoria-formulario-titulo">
                {modoEdicao ? "Editar categoria" : "Nova categoria"}
              </h2>

              <p>
                {modoEdicao
                  ? "Atualize as informações da categoria."
                  : "Preencha os dados para cadastrar uma categoria."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="categoria-formulario__fechar"
            onClick={onFechar}
            disabled={carregando}
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </header>

        {/* Formulário */}
        <form className="categoria-formulario__corpo" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="categoria-formulario__campo">
            <label htmlFor="categoria-nome">
              Nome da categoria
              <span>*</span>
            </label>

            <input
              id="categoria-nome"
              type="text"
              placeholder="Ex.: Fantasia"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={100}
              required
              disabled={carregando}
            />

            <small>{nome.length}/100 caracteres</small>
          </div>

          {/* Descrição */}
          <div className="categoria-formulario__campo">
            <label htmlFor="categoria-descricao">Descrição</label>

            <textarea
              id="categoria-descricao"
              placeholder="Descreva a categoria e os tipos de livros relacionados..."
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              maxLength={2000}
              rows={5}
              disabled={carregando}
            />

            <small>{descricao.length}/2000 caracteres</small>
          </div>

          {/* Mensagem de erro */}
          {erro && <div className="categoria-formulario__erro">{erro}</div>}

          {/* Rodapé */}
          <footer className="categoria-formulario__acoes">
            <button
              type="button"
              className="categoria-formulario__botao-cancelar"
              onClick={onFechar}
              disabled={carregando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="categoria-formulario__botao-salvar"
              disabled={carregando}
            >
              <Save size={17} />

              {carregando
                ? "Salvando..."
                : modoEdicao
                  ? "Salvar alterações"
                  : "Cadastrar categoria"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
