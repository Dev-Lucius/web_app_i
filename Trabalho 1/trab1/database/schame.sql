CREATE DATABASE planos;

use planos;

CREATE TABLE clientes(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO clientes (nome, email, data_cadastro) VALUES
('Ana Silva',      'ana@email.com',     '2024-11-01'),
('Bruno Costa',    'bruno@email.com',   '2024-12-15'),
('Carla Souza',    'carla@email.com',   '2025-01-10'),
('Diego Martins',  'diego@email.com',   '2025-02-20'),
('Eva Lima',       'eva@email.com',     '2025-03-05'),
('Felipe Rocha',   'felipe@email.com',  '2025-04-01'),
('Gabi Nunes',     'gabi@email.com',    '2025-04-10'),
('Hugo Ferreira',  'hugo@email.com',    '2025-04-18'),
('Iris Campos',    'iris@email.com',    '2025-11-30'),
('João Alves',     'joao@email.com',    '2026-02-01');

CREATE TABLE cliente_endereco(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_cliente INTEGER NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    bairro VARCHAR(200) NOT NULL,
    cep VARCHAR(11) NOT NULL,
    -- FK
    FOREIGN KEY(id_cliente) REFERENCES clientes(id)
);
INSERT INTO cliente_endereco(id_cliente, endereco, bairro, cep) VALUES
(1, 'Rua das Flores, 123', 'Centro', '01001-000'),
(2, 'Av. Brasil, 1500', 'Jardim América', '01430-000'),
(3, 'Praça da Sé, 45', 'Sé', '01001-010'),
(4, 'Rua 25 de Março, 500', 'Comércio', '01021-200');

CREATE TABLE planos(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(200) NOT NULL,
    valor_mensal DECIMAL(10, 2) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO planos (descricao, valor_mensal) VALUES
('Plano Básico', 85.00),
('Plano Intermediário', 120.00),
('Plano Avançado', 180.00),
('Plano Premium', 200.00);


CREATE TABLE matriculas(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_cliente INTEGER NOT NULL,
    id_plano INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE DEFAULT NULL,
    -- FK
    FOREIGN KEY(id_cliente) REFERENCES clientes(id),
    FOREIGN KEY(id_plano) REFERENCES planos(id)
);
INSERT INTO matriculas (id_cliente, id_plano, data_inicio, data_fim) VALUES
INSERT INTO matriculas (id_cliente, id_plano, data_inicio, data_fim) VALUES
(1, 2, '2026-01-10', '2026-12-31'),
(2, 1, '2026-02-01', '2026-08-01'),
(3, 3, '2026-02-15', NULL),
(4, 2, '2026-03-01', '2027-03-01'),
(5, 1, '2026-03-10', NULL),
(6, 3, '2026-04-05', '2026-10-05');