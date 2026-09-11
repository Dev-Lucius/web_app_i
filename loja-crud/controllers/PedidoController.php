<?php
class PedidoController {
    private PDO $pdo;
    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function listar(): void {
        $stmt = $this->pdo->query("
            SELECT p.*, c.nome AS cliente_nome 
            FROM pedidos p 
            JOIN clientes c ON p.cliente_id = c.id 
            ORDER BY p.data_hora_pedido DESC
        ");
        $pedidos = $stmt->fetchAll();
        $titulo = 'Pedidos';
        $pagina = 'pedidos';
        ob_start();
        include __DIR__ . '/../views/pedidos/listar.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function criar(): void {
        $clientes = $this->pdo->query("SELECT id, nome FROM clientes WHERE ativo = 1 ORDER BY nome")->fetchAll();
        $produtos = $this->pdo->query("SELECT id, nome, preco, qtd_estoque FROM produtos WHERE ativo = 1 AND qtd_estoque > 0 ORDER BY nome")->fetchAll();
        $enderecos = $this->pdo->query("SELECT id, cliente_id, logradouro, numero, cidade FROM enderecos")->fetchAll();
        $pedido = [];
        $itens = [];
        $titulo = 'Novo Pedido';
        $pagina = 'pedidos';
        ob_start();
        include __DIR__ . '/../views/pedidos/form.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }

    public function editar(?int $id): void {
        flash('Edição de pedido não é permitida. Cancele e crie um novo.', 'warning');
        header('Location: index.php?pagina=pedidos');
        exit;
    }

    public function salvar(): void {
        $cliente_id = (int)($_POST['cliente_id'] ?? 0);
        $endereco_id = $_POST['endereco_entrega_id'] ? (int)$_POST['endereco_entrega_id'] : null;
        $observacao = trim($_POST['observacao'] ?? '');
        $produtos_ids = $_POST['produto_id'] ?? [];
        $quantidades = $_POST['quantidade'] ?? [];

        if (!$cliente_id || empty($produtos_ids)) {
            flash('Selecione um cliente e pelo menos um produto.', 'warning');
            header('Location: index.php?pagina=pedidos&acao=criar');
            exit;
        }

        try {
            $this->pdo->beginTransaction();

            // Inserir pedido
            $stmt = $this->pdo->prepare("
                INSERT INTO pedidos (cliente_id, endereco_entrega_id, status, valor_total, observacao) 
                VALUES (?, ?, 'PENDENTE', 0.00, ?)
            ");
            $stmt->execute([$cliente_id, $endereco_id, $observacao]);
            $pedido_id = (int)$this->pdo->lastInsertId();

            $valor_total = 0.0;

            foreach ($produtos_ids as $i => $produto_id) {
                $produto_id = (int)$produto_id;
                $qtd = (int)($quantidades[$i] ?? 0);
                if ($qtd <= 0 || !$produto_id) continue;

                // Verificar estoque e preço
                $stmt = $this->pdo->prepare("SELECT preco, qtd_estoque FROM produtos WHERE id = ? FOR UPDATE");
                $stmt->execute([$produto_id]);
                $prod = $stmt->fetch();
                if (!$prod) throw new Exception("Produto $produto_id não encontrado.");
                if ($prod['qtd_estoque'] < $qtd) throw new Exception("Estoque insuficiente para: " . $produto_id);

                $preco = (float)$prod['preco'];
                $subtotal = $preco * $qtd;
                $valor_total += $subtotal;

                // Inserir item
                $this->pdo->prepare("
                    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) 
                    VALUES (?, ?, ?, ?)
                ")->execute([$pedido_id, $produto_id, $qtd, $preco]);

                // Atualizar estoque
                $this->pdo->prepare("UPDATE produtos SET qtd_estoque = qtd_estoque - ? WHERE id = ?")
                    ->execute([$qtd, $produto_id]);

                // Registrar movimentação
                $this->pdo->prepare("
                    INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) 
                    VALUES (?, 'SAIDA', ?, ?)
                ")->execute([$produto_id, $qtd, "Pedido #$pedido_id"]);
            }

            // Atualizar total do pedido
            $this->pdo->prepare("UPDATE pedidos SET valor_total = ? WHERE id = ?")
                ->execute([$valor_total, $pedido_id]);

            $this->pdo->commit();
            flash("Pedido #$pedido_id criado com sucesso! Total: R$ " . number_format($valor_total, 2, ',', '.'));
        } catch (Exception $e) {
            $this->pdo->rollBack();
            flash('Erro ao criar pedido: ' . $e->getMessage(), 'danger');
        }

        header('Location: index.php?pagina=pedidos');
        exit;
    }

    public function excluir(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=pedidos'); exit; }
        try {
            $this->pdo->beginTransaction();

            // Buscar itens para devolver estoque
            $itens = $this->pdo->prepare("SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = ?");
            $itens->execute([$id]);
            foreach ($itens->fetchAll() as $item) {
                $this->pdo->prepare("UPDATE produtos SET qtd_estoque = qtd_estoque + ? WHERE id = ?")
                    ->execute([$item['quantidade'], $item['produto_id']]);
                $this->pdo->prepare("
                    INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) 
                    VALUES (?, 'ENTRADA', ?, ?)
                ")->execute([$item['produto_id'], $item['quantidade'], "Cancelamento pedido #$id"]);
            }

            $this->pdo->prepare("DELETE FROM pedidos WHERE id = ?")->execute([$id]);
            $this->pdo->commit();
            flash('Pedido excluído e estoque restaurado.');
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            flash('Erro: ' . $e->getMessage(), 'danger');
        }
        header('Location: index.php?pagina=pedidos');
        exit;
    }

    public function visualizar(?int $id): void {
        if (!$id) { flash('ID inválido.', 'danger'); header('Location: index.php?pagina=pedidos'); exit; }

        $stmt = $this->pdo->prepare("
            SELECT p.*, c.nome AS cliente_nome, c.email, c.telefone,
                   e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep
            FROM pedidos p
            JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN enderecos e ON p.endereco_entrega_id = e.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $pedido = $stmt->fetch();
        if (!$pedido) { flash('Pedido não encontrado.', 'danger'); header('Location: index.php?pagina=pedidos'); exit; }

        $itens = $this->pdo->prepare("
            SELECT ip.*, pr.nome AS produto_nome 
            FROM itens_pedido ip
            JOIN produtos pr ON ip.produto_id = pr.id
            WHERE ip.pedido_id = ?
        ");
        $itens->execute([$id]);
        $itens = $itens->fetchAll();

        $titulo = "Pedido #$id";
        $pagina = 'pedidos';
        ob_start();
        include __DIR__ . '/../views/pedidos/visualizar.php';
        $conteudo = ob_get_clean();
        include __DIR__ . '/../layout.php';
    }
}
