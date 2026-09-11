<?php
class CategoriaController {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listar(): void {
        $stmt = $this->pdo->query("SELECT * FROM categorias ORDER BY nome");
        $categorias = $stmt->fetchAll();
        $titulo = 'Categorias';
        $pagina = 'categorias';
        ob_start();
        include __DIR__ . '/../views/categorias/listar.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function criar(): void {
        $categoria = [];
        $titulo = 'Nova Categoria';
        $pagina = 'categorias';
        ob_start();
        include __DIR__ . '/../views/categorias/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function editar(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=categorias'); exit; }
        $stmt = $this->pdo->prepare("SELECT * FROM categorias WHERE id = ?");
        $stmt->execute([$id]);
        $categoria = $stmt->fetch();
        if (!$categoria) { flash('Categoria não encontrada.', 'danger'); header('Location: index.php?pagina=categorias'); exit; }
        $titulo = 'Editar Categoria';
        $pagina = 'categorias';
        ob_start();
        include __DIR__ . '/../views/categorias/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function salvar(): void {
        $nome = trim($_POST['nome'] ?? '');
        $descricao = trim($_POST['descricao'] ?? '');
        if (empty($nome)) { flash('Nome é obrigatório.', 'warning'); header('Location: index.php?pagina=categorias&acao=' . ($_POST['id']?'editar&id='.$_POST['id']:'criar')); exit; }
        try {
            if (!empty($_POST['id'])) {
                $this->pdo->prepare("UPDATE categorias SET nome=?, descricao=? WHERE id=?")->execute([$nome, $descricao, $_POST['id']]);
                flash('Categoria atualizada!');
            } else {
                $this->pdo->prepare("INSERT INTO categorias (nome, descricao) VALUES (?,?)")->execute([$nome, $descricao]);
                flash('Categoria cadastrada!');
            }
        } catch (PDOException $e) { flash('Erro: ' . $e->getMessage(), 'danger'); }
        header('Location: index.php?pagina=categorias'); exit;
    }

    public function excluir(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=categorias'); exit; }
        try {
            $check = $this->pdo->prepare("SELECT COUNT(*) FROM produtos WHERE categoria_id = ?");
            $check->execute([$id]);
            if ($check->fetchColumn() > 0) {
                flash('Existem produtos vinculados a esta categoria.', 'warning');
            } else {
                $this->pdo->prepare("DELETE FROM categorias WHERE id = ?")->execute([$id]);
                flash('Categoria excluída!');
            }
        } catch (PDOException $e) { flash('Erro: ' . $e->getMessage(), 'danger'); }
        header('Location: index.php?pagina=categorias'); exit;
    }
}
