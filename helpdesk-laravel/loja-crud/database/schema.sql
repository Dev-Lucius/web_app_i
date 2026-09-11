DROP DATABASE IF EXISTS loja;
CREATE DATABASE loja CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf)
);

CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo ENUM('ENTREGA', 'COBRANCA') DEFAULT 'ENTREGA',
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(50),
    cidade VARCHAR(50) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    padrao BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id)
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    qtd_estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_categoria (categoria_id),
    INDEX idx_ativo (ativo),
    CHECK (preco >= 0),
    CHECK (qtd_estoque >= 0)
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    endereco_entrega_id INT,
    status ENUM('PENDENTE', 'PAGO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO') DEFAULT 'PENDENTE',
    valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    observacao TEXT,
    data_hora_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (endereco_entrega_id) REFERENCES enderecos(id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_status (status),
    INDEX idx_data (data_hora_pedido)
);

CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    INDEX idx_pedido (pedido_id),
    CHECK (quantidade > 0),
    CHECK (preco_unitario >= 0)
);

CREATE TABLE movimentacoes_estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo ENUM('ENTRADA', 'SAIDA', 'AJUSTE') NOT NULL,
    quantidade INT NOT NULL,
    motivo VARCHAR(255),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    INDEX idx_produto (produto_id),
    INDEX idx_data (data_hora)
);


INSERT INTO categorias (nome, descricao) VALUES
('Eletrônicos', 'Produtos eletrônicos e gadgets'),
('Roupas', 'Vestuário masculino e feminino'),
('Alimentos', 'Produtos alimentícios e bebidas'),
('Livros', 'Livros físicos e e-books'),
('Esportes', 'Equipamentos e acessórios esportivos');

INSERT INTO clientes (nome, email, telefone, cpf, data_nascimento, ativo) VALUES
('Ana Paula Silva', 'ana.silva@email.com', '(11) 91234-5678', '123.456.789-00', '1990-05-15', 1),
('Bruno Oliveira', 'bruno.oliveira@email.com', '(21) 98765-4321', '234.567.890-11', '1985-08-22', 1),
('Carla Mendes', 'carla.mendes@email.com', '(31) 99876-5432', '345.678.901-22', '1992-11-03', 1),
('Diego Ferreira', 'diego.ferreira@email.com', '(41) 97654-3210', '456.789.012-33', '1988-02-18', 0),
('Elisa Costa', 'elisa.costa@email.com', '(51) 96543-2109', '567.890.123-44', '1995-07-30', 1);

INSERT INTO enderecos (cliente_id, tipo, logradouro, numero, complemento, bairro, cidade, estado, cep, padrao) VALUES
(1, 'ENTREGA', 'Rua das Flores', '123', 'Apto 45', 'Jardim Primavera', 'São Paulo', 'SP', '01000-000', 1),
(1, 'COBRANCA', 'Rua das Flores', '123', 'Apto 45', 'Jardim Primavera', 'São Paulo', 'SP', '01000-000', 0),
(2, 'ENTREGA', 'Avenida Brasil', '456', NULL, 'Centro', 'Rio de Janeiro', 'RJ', '20000-000', 1),
(3, 'ENTREGA', 'Rua Minas Gerais', '789', 'Casa 2', 'Savassi', 'Belo Horizonte', 'MG', '30100-000', 1),
(4, 'ENTREGA', 'Rua Paraná', '321', 'Bloco B', 'Batel', 'Curitiba', 'PR', '80000-000', 1),
(5, 'ENTREGA', 'Avenida Beira Mar', '654', 'Sala 101', 'Moinhos de Vento', 'Porto Alegre', 'RS', '90000-000', 1);

INSERT INTO produtos (categoria_id, nome, descricao, preco, qtd_estoque, estoque_minimo, ativo) VALUES
(1, 'Smartphone Galaxy X', 'Celular com 128GB, tela AMOLED 6.5"', 2499.90, 15, 5, 1),
(1, 'Fone Bluetooth Pro', 'Fone de ouvido com cancelamento de ruído', 349.90, 30, 10, 1),
(1, 'Carregador Rápido 65W', 'Carregador USB-C com tecnologia de carga rápida', 129.90, 50, 15, 1),
(2, 'Camiseta Básica Preta', 'Camiseta 100% algodão, tamanho M', 59.90, 100, 20, 1),
(2, 'Calça Jeans Slim', 'Calça jeans azul escuro, corte slim', 179.90, 40, 10, 1),
(2, 'Tênis Esportivo Runner', 'Tênis leve para corrida, solado anti-derrapante', 299.90, 25, 8, 1),
(3, 'Café Especial 250g', 'Café arábica torrado em grãos', 39.90, 80, 20, 1),
(3, 'Chocolate Amargo 70%', 'Barra de chocolate 70% cacau, 100g', 19.90, 120, 30, 1),
(4, 'O Senhor dos Anéis', 'Edição completa em capa dura', 89.90, 12, 5, 1),
(4, 'Clean Code', 'Livro sobre boas práticas de programação', 129.90, 20, 5, 1),
(5, 'Halter 10kg', 'Par de halteres revestidos em borracha', 149.90, 18, 5, 1),
(5, 'Tapete de Yoga', 'Tapete antiderrapante, 6mm de espessura', 79.90, 35, 10, 1),
(1, 'Mouse Gamer RGB', 'Mouse com 12.000 DPI e iluminação RGB', 199.90, 8, 5, 1);

INSERT INTO pedidos (cliente_id, endereco_entrega_id, status, valor_total, observacao, data_hora_pedido) VALUES
(1, 1, 'ENTREGUE', 2849.70, 'Entregar após as 18h', '2026-08-10 14:30:00'),
(2, 3, 'ENVIADO', 539.80, NULL, '2026-08-12 09:15:00'),
(3, 4, 'PAGO', 109.80, 'Embalar para presente', '2026-08-14 16:45:00'),
(1, 1, 'PENDENTE', 59.90, NULL, '2026-08-15 10:00:00'),
(5, 6, 'EM_SEPARACAO', 229.80, 'Fragil, cuidado na entrega', '2026-08-15 11:20:00');

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
(1, 1, 1, 2499.90),
(1, 2, 1, 349.90),
(2, 4, 2, 59.90),
(2, 6, 1, 299.90),
(2, 8, 2, 19.90),
(3, 9, 1, 89.90),
(3, 10, 1, 129.90),
(3, 7, 1, 39.90),
(3, 8, 1, 19.90),
(4, 4, 1, 59.90),
(5, 11, 1, 149.90),
(5, 12, 1, 79.90);

INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data_hora) VALUES
(1, 'SAIDA', 1, 'Pedido #1', '2026-08-10 14:30:00'),
(2, 'SAIDA', 1, 'Pedido #1', '2026-08-10 14:30:00'),
(4, 'SAIDA', 2, 'Pedido #2', '2026-08-12 09:15:00'),
(6, 'SAIDA', 1, 'Pedido #2', '2026-08-12 09:15:00'),
(8, 'SAIDA', 2, 'Pedido #2', '2026-08-12 09:15:00'),
(9, 'SAIDA', 1, 'Pedido #3', '2026-08-14 16:45:00'),
(10, 'SAIDA', 1, 'Pedido #3', '2026-08-14 16:45:00'),
(7, 'SAIDA', 1, 'Pedido #3', '2026-08-14 16:45:00'),
(8, 'SAIDA', 1, 'Pedido #3', '2026-08-14 16:45:00'),
(4, 'SAIDA', 1, 'Pedido #4', '2026-08-15 10:00:00'),
(11, 'SAIDA', 1, 'Pedido #5', '2026-08-15 11:20:00'),
(12, 'SAIDA', 1, 'Pedido #5', '2026-08-15 11:20:00');