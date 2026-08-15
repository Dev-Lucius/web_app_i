# 📘 Lista de Exercícios — Programação Back-End em PHP

> **Nível:** Fácil | Médio | Difícil  
> **Foco:** PHP puro, MySQL, PDO, sessões, APIs, arquitetura e boas práticas.

---

## 🟢 NÍVEL FÁCIL — Fundamentos de PHP

### 1. Variáveis, Tipos e Operadores
1. Crie um script que receba dois números via `$_GET` e exiba a soma, subtração, multiplicação e divisão.
2. Receba o nome e a idade de uma pessoa via formulário HTML e exiba: `"Olá, [nome]! Daqui a 10 anos você terá [idade+10] anos."`
3. Crie uma função `ehPar($numero)` que retorne `true` se o número for par e `false` caso contrário.
4. Receba uma temperatura em Celsius e converta para Fahrenheit usando a fórmula: `F = (C × 9/5) + 32`.
5. Crie um script que receba um valor em reais e converta para dólares, usando uma taxa de câmbio fixa.

### 2. Estruturas de Controle
6. Crie um script que receba um número e exiba a tabuada de 1 a 10 desse número.
7. Receba um ano e determine se ele é bissexto. (Regra: divisível por 4, exceto se divisível por 100, a menos que também seja por 400.)
8. Crie um menu de opções (1-Somar, 2-Subtrair, 3-Multiplicar, 4-Dividir) usando `switch`.
9. Exiba todos os números de 1 a 100, mas substitua múltiplos de 3 por "Fizz", de 5 por "Buzz", e de ambos por "FizzBuzz".
10. Receba uma nota de 0 a 10 e exiba o conceito: A(9-10), B(7-8.9), C(5-6.9), D(3-4.9), F(0-2.9).

### 3. Arrays
11. Crie um array com 5 nomes de frutas e exiba-os em uma lista HTML (`<ul>`).
12. Receba 5 números em um array e exiba o maior, o menor e a média.
13. Crie um array associativo com informações de 3 alunos (nome, nota1, nota2) e exiba a média de cada um.
14. Ordene um array de números em ordem crescente e decrescente.
15. Verifique se um valor existe em um array usando `in_array()`.

### 4. Funções
16. Crie uma função `fatorial($n)` que calcule o fatorial de um número.
17. Crie uma função `contarVogais($texto)` que retorne a quantidade de vogais em uma string.
18. Crie uma função `inverterString($texto)` sem usar `strrev()`.
19. Crie uma função `ehPalindromo($texto)` que verifique se uma palavra é palíndromo.
20. Crie uma função `formatarCPF($cpf)` que receba `"12345678900"` e retorne `"123.456.789-00"`.

### 5. Formulários e $_POST/$_GET
21. Crie um formulário de login simples. Se o usuário digitar "admin"/"1234", exiba "Bem-vindo!", senão "Acesso negado".
22. Crie um formulário de cadastro de contato (nome, email, mensagem) e exiba os dados recebidos formatados.
23. Crie uma calculadora web com dois campos e um botão para cada operação (+, -, ×, ÷).
24. Crie um formulário que receba uma data e exiba o dia da semana correspondente.
25. Crie um formulário que receba uma frase e exiba: maiúsculas, minúsculas, quantidade de caracteres e palavras.

---

## 🟡 NÍVEL MÉDIO — PHP + Banco de Dados (MySQL/PDO)

### 6. CRUD Básico com PDO
26. Crie um CRUD completo para uma tabela `tarefas` (id, titulo, descricao, concluida, data_criacao).
27. Adicione paginação (10 itens por página) ao CRUD de tarefas.
28. Implemente busca por título no CRUD de tarefas.
29. Crie um CRUD para `usuarios` com validação de email único usando PDO.
30. Adicione ordenação clicável nas colunas da listagem (clica em "Título" → ordena A-Z ou Z-A).

### 7. Relacionamentos e JOINs
31. Crie um sistema de blog com tabelas `posts` e `categorias`. Liste os posts com o nome da categoria usando JOIN.
32. Crie um sistema de comentários onde cada post pode ter vários comentários. Exiba os posts com a contagem de comentários.
33. Crie um sistema de biblioteca com `autores` e `livros`. Um autor pode ter vários livros. Exiba a listagem com INNER JOIN.
34. Implemente um filtro por categoria no blog usando query string (`?categoria=tecnologia`).
35. Crie um relatório que mostre quantos posts existem por categoria, ordenado do maior para o menor.

### 8. Validação e Segurança
36. Crie uma função `validarEmail($email)` usando filter_var e verificação de DNS (checkdnsrr).
37. Crie uma função `validarCPF($cpf)` com todos os dígitos verificadores.
38. Implemente proteção contra SQL Injection em todos os CRUDs usando prepared statements.
39. Crie uma função `limparInput($dado)` que remova tags HTML, espaços e escapar caracteres especiais.
40. Implemente hash de senha com `password_hash()` e verificação com `password_verify()`.

### 9. Sessões e Autenticação
41. Crie um sistema de login com sessão. Após logar, o usuário vê uma página restrita.
42. Implemente logout que destrua a sessão completamente.
43. Crie um sistema de "Lembrar-me" usando cookies para manter o usuário logado por 7 dias.
44. Implemente níveis de acesso: `admin` pode tudo, `editor` pode criar/editar, `visitante` só pode visualizar.
45. Crie uma página de perfil onde o usuário logado pode alterar sua própria senha (requer senha atual).

### 10. Upload e Manipulação de Arquivos
46. Crie um formulário de upload de imagem. Valide: apenas JPG/PNG, máximo 2MB, e redimensione para 800x600.
47. Crie um sistema de galeria que liste todas as imagens de uma pasta em um grid HTML.
48. Implemente download de arquivo protegido: o arquivo só pode ser baixado por usuários logados.
49. Crie um sistema de importação CSV que leia um arquivo e insira os dados no banco de dados.
50. Crie um sistema de exportação: exporte os dados de uma tabela para CSV e para JSON.

---

## 🔴 NÍVEL DIFÍCIL — Arquitetura, APIs e Padrões Avançados

### 11. Padrões de Projeto (Design Patterns)
51. Implemente o padrão **Singleton** na classe de conexão com o banco (garantir apenas uma instância PDO).
52. Implemente o padrão **Repository**: crie uma classe `UsuarioRepository` que isole todas as queries de usuários.
53. Implemente o padrão **MVC** completo: separe Models, Views e Controllers em pastas distintas.
54. Implemente o padrão **Factory**: crie uma `ConnectionFactory` que retorne conexões PDO ou SQLite dependendo da configuração.
55. Implemente o padrão **Strategy**: crie diferentes estratégias de cálculo de frete (Sedex, PAC, Retirada) com a mesma interface.

### 12. APIs RESTful
56. Crie uma API REST para `produtos` com endpoints: `GET /api/produtos`, `POST /api/produtos`, `PUT /api/produtos/{id}`, `DELETE /api/produtos/{id}`. Retorne JSON.
57. Implemente autenticação na API usando **JWT (JSON Web Tokens)**.
58. Crie paginação, ordenação e filtros nos endpoints da API (`?page=2&limit=10&order=preco_desc`).
59. Implemente versionamento de API (`/api/v1/produtos` e `/api/v2/produtos`).
60. Crie documentação da API usando um formato simples (README.md com exemplos de requisição/resposta).

### 13. Transações e Integridade de Dados
61. Crie um sistema de transferência bancária simples. Use transações PDO para garantir que o débito e o crédito ocorram juntos.
62. Implemente um carrinho de compras com checkout: ao finalizar, use transaction para criar o pedido, os itens e atualizar o estoque.
63. Crie um sistema de reserva de ingressos. Use `FOR UPDATE` no SELECT para evitar overbooking.
64. Implemente um log de auditoria: toda alteração em uma tabela sensível deve ser registrada em uma tabela `auditoria`.
65. Crie um mecanismo de soft delete: em vez de `DELETE`, use uma coluna `deleted_at`. Filtre registros deletados em todas as queries.

### 14. Performance e Otimização
66. Implemente cache em arquivo: salve o resultado de uma query pesada em um arquivo JSON e só reexecute após 5 minutos.
67. Crie um sistema de paginação eficiente com `LIMIT` e `OFFSET`, mas também com paginação por cursor para grandes volumes.
68. Implemente lazy loading de relacionamentos: carregue os dados relacionados apenas quando necessário.
69. Crie um script que otimize imagens automaticamente após o upload (usando GD ou Imagick).
70. Implemente compressão GZIP nas respostas da API usando `ob_start('ob_gzhandler')`.

### 15. Testes e Qualidade de Código
71. Escreva testes unitários para a função `validarCPF()` usando PHPUnit.
72. Crie testes de integração para o CRUD de produtos (inserir, buscar, atualizar, excluir).
73. Implemente tratamento global de exceções com um `try/catch` no ponto de entrada (`index.php`) que logue erros em arquivo.
74. Crie uma classe `Validator` genérica que valide regras dinâmicas (`required`, `email`, `min:3`, `max:255`).
75. Documente todo o código com PHPDoc e gere documentação automática com phpDocumentor.

### 16. Projeto Final Integrador
76. **Sistema de E-commerce Completo:**
    - Cadastro de clientes, produtos, categorias e pedidos
    - Carrinho de compras com sessão
    - Checkout com transação e controle de estoque
    - Área administrativa com login e níveis de acesso
    - Relatório de vendas por período
    - API REST para consulta de produtos
    - Exportação de pedidos para CSV

77. **Sistema de Gestão Escolar:**
    - CRUD de alunos, professores, disciplinas e turmas
    - Matrícula de alunos em turmas (relacionamento N:N)
    - Lançamento de notas e cálculo de média
    - Boletim escolar em PDF (usando biblioteca como FPDF)
    - Dashboard com gráficos de desempenho

78. **Sistema de Blog com Painel Admin:**
    - CRUD de posts com editor de texto rico
    - Sistema de tags (N:N com posts)
    - Comentários com moderação
    - Upload de imagem de capa
    - SEO básico (slug, meta description)
    - Feed RSS

79. **API de Gerenciamento de Tarefas (Todo List):**
    - Autenticação JWT
    - CRUD completo de tarefas
    - Filtros por status, data e prioridade
    - Paginação e ordenação
    - Documentação da API
    - Rate limiting (limite de requisições por minuto)

80. **Sistema de Reservas de Hotel:**
    - CRUD de quartos, hóspedes e reservas
    - Verificação de disponibilidade por data
    - Cálculo automático de diárias e total
    - Confirmação por email (usando PHPMailer ou mail())
    - Relatório de ocupação por mês
    - Cancelamento com política de reembolso

---

## 📚 Recursos Complementares

- [PHP Official Docs](https://www.php.net/docs.php)
- [PHP: The Right Way](https://phptherightway.com/)
- [MySQL Tutorial](https://dev.mysql.com/doc/)
- [REST API Tutorial](https://restfulapi.net/)
- [PHPUnit Docs](https://phpunit.de/documentation.html)

---

*Última atualização: 2026*
