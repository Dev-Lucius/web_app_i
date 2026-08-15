# Loja CRUD — PHP Puro

Sistema de gerenciamento de loja com CRUD completo em PHP puro + MySQL + Bootstrap 5.

## Estrutura

```
loja-crud/
├── index.php              # Router principal
├── config.php             # Configurações do banco
├── conexao.php            # Conexão PDO singleton
├── schema.sql             # Script SQL do banco
├── .htaccess              # Rewrite rules (opcional)
├── controllers/
│   ├── ClienteController.php
│   ├── CategoriaController.php
│   ├── ProdutoController.php
│   └── PedidoController.php
├── views/
│   ├── layout.php
│   ├── home.php
│   ├── clientes/
│   ├── categorias/
│   ├── produtos/
│   └── pedidos/
```

## Instalação

1. Crie o banco executando o `schema.sql` no MySQL.
2. Ajuste `config.php` com seus dados de conexão.
3. Coloque os arquivos em um servidor com PHP 8.1+.
4. Acesse `index.php` pelo navegador.

## Funcionalidades

- **Clientes**: cadastro, edição, exclusão (com validação de pedidos vinculados)
- **Categorias**: organização dos produtos
- **Produtos**: controle de estoque com alerta de baixa quantidade
- **Pedidos**: criação com múltiplos itens, controle de estoque automático, visualização detalhada
- **Movimentações de estoque**: registradas automaticamente em cada venda/cancelamento
- **Transações**: todas as operações de pedido usam `BEGIN TRANSACTION` para garantir integridade

## Segurança

- Prepared statements em todas as queries
- Escape de output com `htmlspecialchars()`
- Validação de estoque antes da venda
- Verificação de dependências antes da exclusão

