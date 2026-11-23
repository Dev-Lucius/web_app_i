import { useEffect, useMemo, useState } from "react";

import { Users, UserRound, FileText, Search, Plus, Trash2 } from "lucide-react";

import { listarAutores, deletarAutor } from "../services/autores.service";

import AutorTabela from "../components/autores/AutorTabela";
import AutorFormulario from "../components/autores/AutorFormulario";

import "../styles/autores.css";

export default function Autores() {
  // Lista de autores
  const [autores, setAutores] = useState([]);

  // Pesquisa
  const [pesquisa, setPesquisa] = useState("");

  // Estados de carregamento e erro
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Controle do formulário
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [autorSelecionado, setAutorSelecionado] = useState(null);

  // Controle para atualizar a listagem
  const [recarregar, setRecarregar] = useState(0);

  // Controle da exclusão
  const [autorParaExcluir, setAutorParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  /*
    |--------------------------------------------------------------------------
    | CARREGAR AUTORES
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    async function carregarAutores() {
      try {
        setCarregando(true);
        setErro("");

        const resultado = await listarAutores();

        const lista = Array.isArray(resultado)
          ? resultado
          : (resultado.autores ?? []);

        setAutores(lista);
      } catch (error) {
        console.error("Erro ao carregar autores:", error);

        setErro(
          error.response?.data?.erro || "Não foi possível carregar os autores.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAutores();
  }, [recarregar]);

  /*
    |--------------------------------------------------------------------------
    | ABRIR FORMULÁRIO PARA CADASTRO
    |--------------------------------------------------------------------------
    */

  function abrirCadastro() {
    setAutorSelecionado(null);
    setFormularioAberto(true);
  }

  /*
    |--------------------------------------------------------------------------
    | ABRIR FORMULÁRIO PARA EDIÇÃO
    |--------------------------------------------------------------------------
    */

  function abrirEdicao(autor) {
    setAutorSelecionado(autor);
    setFormularioAberto(true);
  }

  /*
    |--------------------------------------------------------------------------
    | FECHAR FORMULÁRIO
    |--------------------------------------------------------------------------
    */

  function fecharFormulario() {
    setFormularioAberto(false);
    setAutorSelecionado(null);
  }

  /*
    |--------------------------------------------------------------------------
    | APÓS CADASTRAR OU EDITAR
    |--------------------------------------------------------------------------
    */

  function salvarSucesso() {
    fecharFormulario();

    // Altera o estado para disparar novamente o useEffect
    setRecarregar((valorAtual) => valorAtual + 1);
  }

  /*
|--------------------------------------------------------------------------
| SOLICITAR EXCLUSÃO
|--------------------------------------------------------------------------
*/

  function solicitarExclusao(autor) {
    setAutorParaExcluir(autor);
    setErroExclusao("");
  }

  /*
|--------------------------------------------------------------------------
| CANCELAR EXCLUSÃO
|--------------------------------------------------------------------------
*/

  function cancelarExclusao() {
    if (excluindo) return;

    setAutorParaExcluir(null);
    setErroExclusao("");
  }

  /*
|--------------------------------------------------------------------------
| CONFIRMAR EXCLUSÃO
|--------------------------------------------------------------------------
*/

  async function confirmarExclusao() {
    if (!autorParaExcluir) return;

    try {
      setExcluindo(true);
      setErroExclusao("");

      await deletarAutor(autorParaExcluir.id);

      // Fecha a confirmação
      setAutorParaExcluir(null);

      // Atualiza a listagem
      setRecarregar((valorAtual) => valorAtual + 1);
    } catch (error) {
      console.error("Erro ao excluir autor:", error);

      setErroExclusao(
        error.response?.data?.erro ||
          "Não foi possível excluir o autor. Tente novamente.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | PESQUISAR AUTORES
    |--------------------------------------------------------------------------
    */

  const autoresFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();

    return autores.filter((autor) => {
      const correspondeNome = autor.nome?.toLowerCase().includes(termo);

      const correspondeBiografia = autor.biografia
        ?.toLowerCase()
        .includes(termo);

      return correspondeNome || correspondeBiografia;
    });
  }, [autores, pesquisa]);

  /*
    |--------------------------------------------------------------------------
    | INDICADORES
    |--------------------------------------------------------------------------
    */

  const totalAutores = autores.length;

  const autoresComBiografia = autores.filter((autor) =>
    Boolean(autor.biografia?.trim()),
  ).length;

  const autoresSemBiografia = totalAutores - autoresComBiografia;

  /*
    |--------------------------------------------------------------------------
    | RENDERIZAÇÃO
    |--------------------------------------------------------------------------
    */

  return (
    <section className="autores">
      {/* CABEÇALHO */}
      <div className="autores__cabecalho">
        <div>
          <h1>Autores</h1>

          <p>Consulte e gerencie os autores cadastrados na biblioteca.</p>
        </div>

        <button
          type="button"
          className="autores__botao-novo"
          onClick={abrirCadastro}
        >
          <Plus size={18} />
          Novo autor
        </button>
      </div>

      {/* INDICADORES */}
      <div className="autores__indicadores">
        <div className="autores__indicador">
          <div className="autores__indicador-icone">
            <Users size={21} />
          </div>

          <div>
            <span>Total de autores</span>
            <strong>{totalAutores}</strong>
          </div>
        </div>

        <div className="autores__indicador">
          <div className="autores__indicador-icone autores__indicador-icone--sucesso">
            <FileText size={21} />
          </div>

          <div>
            <span>Com biografia</span>
            <strong>{autoresComBiografia}</strong>
          </div>
        </div>

        <div className="autores__indicador">
          <div className="autores__indicador-icone autores__indicador-icone--alerta">
            <UserRound size={21} />
          </div>

          <div>
            <span>Sem biografia</span>
            <strong>{autoresSemBiografia}</strong>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="autores__conteudo">
        <div className="autores__conteudo-cabecalho">
          <div>
            <h2>Autores cadastrados</h2>

            <p>{autoresFiltrados.length} autor(es) encontrado(s)</p>
          </div>
        </div>

        {/* PESQUISA */}
        <div className="autores__filtros">
          <div className="autores__pesquisa">
            <Search size={18} />

            <input
              type="text"
              placeholder="Pesquisar por nome ou biografia..."
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
            />
          </div>
        </div>

        {/* ESTADOS E TABELA */}
        {carregando ? (
          <div className="autores__estado">Carregando autores...</div>
        ) : erro ? (
          <div className="autores__estado autores__estado--erro">{erro}</div>
        ) : (
          <AutorTabela
            autores={autoresFiltrados}
            onEditar={abrirEdicao}
            onExcluir={solicitarExclusao}
          />
        )}
      </div>

      {/* MODAL DE CADASTRO E EDIÇÃO */}
      {formularioAberto && (
        <AutorFormulario
          autor={autorSelecionado}
          onFechar={fecharFormulario}
          onSucesso={salvarSucesso}
        />
      )}
      
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {autorParaExcluir && (
        <div className="autor-exclusao__overlay">
          <section
            className="autor-exclusao"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="autor-exclusao-titulo"
          >
            <div className="autor-exclusao__icone">
              <Trash2 size={25} />
            </div>

            <h2 id="autor-exclusao-titulo">Excluir autor?</h2>

            <p>
              Tem certeza de que deseja excluir o autor{" "}
              <strong>{autorParaExcluir.nome}</strong>?
            </p>

            <p className="autor-exclusao__aviso">
              Essa ação não poderá ser desfeita. Autores associados a livros não
              podem ser excluídos.
            </p>

            {erroExclusao && (
              <div className="autor-exclusao__erro">{erroExclusao}</div>
            )}

            <div className="autor-exclusao__acoes">
              <button
                type="button"
                className="autor-exclusao__cancelar"
                onClick={cancelarExclusao}
                disabled={excluindo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="autor-exclusao__confirmar"
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                <Trash2 size={16} />

                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
