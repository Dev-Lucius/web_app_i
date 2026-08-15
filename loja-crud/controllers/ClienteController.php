<?php
class ClienteController {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listar(): void {
        $stmt = $this->pdo->query("SELECT * FROM clientes ORDER BY nome");
        $clientes = $stmt->fetchAll();
        $titulo = 'Clientes';
        $pagina = 'clientes';
        ob_start();
        include __DIR__ . '/../views/clientes/listar.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function criar(): void {
        $cliente = [];
        $titulo = 'Novo Cliente';
        $pagina = 'clientes';
        ob_start();
        include __DIR__ . '/../views/clientes/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function editar(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=clientes'); exit; }
        $stmt = $this->pdo->prepare("SELECT * FROM clientes WHERE id = ?");
        $stmt->execute([$id]);
        $cliente = $stmt->fetch();
        if (!$cliente) { flash('Cliente não encontrado.', 'danger'); header('Location: index.php?pagina=clientes'); exit; }
        $titulo = 'Editar Cliente';
        $pagina = 'clientes';
        ob_start();
        include __DIR__ . '/../views/clientes/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function salvar(): void {
        $dados = [
            'nome' => trim($_POST['nome'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'telefone' => trim($_POST['telefone'] ?? ''),
            'cpf' => trim($_POST['cpf'] ?? ''),
            'data_nascimento' => $_POST['data_nascimento'] ?: null,
            'ativo' => isset($_POST['ativo']) ? 1 : 0,
        ];

        if (empty($dados['nome']) || empty($dados['email']) || empty($dados['cpf'])) {
            flash('Preencha todos os campos obrigatórios.', 'warning');
            header('Location: ' . ($_POST['id'] ? "index.php?pagina=clientes&acao=editar&id={$_POST['id']}" : 'index.php?pagina=clientes&acao=criar'));
            exit;
        }

        try {
            if (!empty($_POST['id'])) {
                $sql = "UPDATE clientes SET nome=?, email=?, telefone=?, cpf=?, data_nascimento=?, ativo=? WHERE id=?";
                $this->pdo->prepare($sql)->execute([...array_values($dados), $_POST['id']]);
                flash('Cliente atualizado com sucesso!');
            } else {
                $sql = "INSERT INTO clientes (nome, email, telefone, cpf, data_nascimento, ativo) VALUES (?,?,?,?,?,?)";
                $this->pdo->prepare($sql)->execute(array_values($dados));
                flash('Cliente cadastrado com sucesso!');
            }
        } catch (PDOException $e) {
            flash('Erro: ' . $e->getMessage(), 'danger');
        }
        header('Location: index.php?pagina=clientes');
        exit;
    }

    public function excluir(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=clientes'); exit; }
        try {
            $check = $this->pdo->prepare("SELECT COUNT(*) FROM pedidos WHERE cliente_id = ?");
            $check->execute([$id]);
            if ($check->fetchColumn() > 0) {
                flash('Não é possível excluir: cliente possui pedidos vinculados.', 'warning');
            } else {
                $this->pdo->prepare("DELETE FROM clientes WHERE id = ?")->execute([$id]);
                flash('Cliente excluído com sucesso!');
            }
        } catch (PDOException $e) {
            flash('Erro ao excluir: ' . $e->getMessage(), 'danger');
        }
        header('Location: index.php?pagina=clientes');
        exit;
    }
}
