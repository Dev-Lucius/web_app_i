-- ---------------------------------------------------------------------
-- schema.sql
-- ---------------------------------------------------------------------
-- Mesma estrutura do PurchasesDB.sql original, com pequenos ajustes:
--
--  1) `passwd` passou de VARCHAR(255) para VARCHAR(255) mesmo, mas
--     agora guarda o hash gerado por password_hash() (formato bcrypt),
--     que tem até 60 caracteres — 255 já é mais do que suficiente,
--     então nenhuma mudança de tamanho foi necessária.
--  2) `email` ganhou uma UNIQUE KEY: o PHP já confere se o e-mail
--     existe antes de cadastrar, mas é o banco quem deve garantir essa
--     regra de verdade (o PHP pode ter bugs; uma constraint no banco
--     não falha).
--  3) Trocamos o charset de latin1 para utf8mb4, para não ter problema
--     ao salvar nomes com acento (ex: "José", "María").
-- ---------------------------------------------------------------------

CREATE TABLE `customers` (
  `id`     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name`   VARCHAR(255) NOT NULL,
  `email`  VARCHAR(255) NOT NULL,
  `passwd` VARCHAR(255) NOT NULL,
  UNIQUE KEY `uk_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orders` (
  `id`          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `description` VARCHAR(255) NOT NULL,
  `amount`      DOUBLE NOT NULL,
  `customer_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `orders`
  ADD CONSTRAINT `fk_id_order` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
  ON DELETE CASCADE;

-- Dica: para criar o usuário administrador, cadastre-se normalmente
-- pela tela de registro usando o nome exatamente "admin"
-- (é esse nome que o sistema usa para reconhecer o administrador —
-- veja a constante ADMIN_NAME em config.php e a seção "Possíveis
-- melhorias" do README.md).
