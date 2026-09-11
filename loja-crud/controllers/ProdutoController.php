<?php
class ProdutoController {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listar(): void {
        $stmt = $this->pdo->query("
            SELECT p.*, c.nome AS categoria_nome 
            FROM produtos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.nome
        ");
        $produtos = $stmt->fetchAll();
        $titulo = 'Produtos';
        $pagina = 'produtos';
        ob_start();
        include __DIR__ . '/../views/produtos/listar.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function criar(): void {
        $produto = [];
        $categorias = $this->pdo->query("SELECT id, nome FROM categorias ORDER BY nome")->fetchAll();
        $titulo = 'Novo Produto';
        $pagina = 'produtos';
        ob_start();
        include __DIR__ . '/../views/produtos/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function editar(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=produtos'); exit; }
        $stmt = $this->pdo->prepare("SELECT * FROM produtos WHERE id = ?");
        $stmt->execute([$id]);
        $produto = $stmt->fetch();
        if (!$produto) { flash('Produto não encontrado.', 'danger'); header('Location: index.php?pagina=produtos'); exit; }
        $categorias = $this->pdo->query("SELECT id, nome FROM categorias ORDER BY nome")->fetchAll();
        $titulo = 'Editar Produto';
        $pagina = 'produtos';
        ob_start();
        include __DIR__ . '/../views/produtos/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function salvar(): void {
        $dados = [
            'nome' => trim($_POST['nome'] ?? ''),
            'descricao' => trim($_POST['descricao'] ?? ''),
            'categoria_id' => $_POST['categoria_id'] ? (int)$_POST['categoria_id'] : null,
            'preco' => (float)str_replace(',', '.', $_POST['preco'] ?? '0'),
            'qtd_estoque' => (int)($_POST['qtd_estoque'] ?? 0),
            'estoque_minimo' => (int)($_POST['estoque_minimo'] ?? 5),
            'ativo' => isset($_POST['ativo']) ? 1 : 0,
        ];
        if (empty($dados['nome'])) {
            flash('Nome é obrigatório.', 'warning');
            header('Location: index.php?pagina=produtos&acao=' . ($_POST['id']?'editar&id='.$_POST['id']:'criar')); exit;
        }
        try {
            if (!empty($_POST['id'])) {
                $sql = "UPDATE produtos SET nome=?, descricao=?, categoria_id=?, preco=?, qtd_estoque=?, estoque_minimo=?, ativo=? WHERE id=?";
                $this->pdo->prepare($sql)->execute([...array_values($dados), $_POST['id']]);
                flash('Produto atualizado!');
            } else {
                $sql = "INSERT INTO produtos (nome, descricao, categoria_id, preco, qtd_estoque, estoque_minimo, ativo) VALUES (?,?,?,?,?,?,?)";
                $this->pdo->prepare($sql)->execute(array_values($dados));
                flash('Produto cadastrado!');
            }
        } catch (PDOException $e) { flash('Erro: ' . $e->getMessage(), 'danger'); }
        header('Location: index.php?pagina=produtos'); exit;
    }

    public function excluir(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=produtos'); exit; }
        try {
            $check = $this->pdo->prepare("SELECT COUNT(*) FROM itens_pedido WHERE produto_id = ?");
            $check->execute([$id]);
            if ($check->fetchColumn() > 0) {
                flash('Produto já foi vendido e não pode ser excluído.', 'warning');
            } else {
                $this->pdo->prepare("DELETE FROM produtos WHERE id = ?")->execute([$id]);
                flash('Produto excluído!');
            }
        } catch (PDOException $e) { flash('Erro: ' . $e->getMessage(), 'danger'); }
        header('Location: index.php?pagina=produtos'); exit;
    }
}
