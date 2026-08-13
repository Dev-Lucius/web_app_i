<?php
/**
 * =======================================================================
 *  main.php — COLA / RESUMO COMPLETO DE PHP
 * =======================================================================
 * Este arquivo NÃO é o sistema em si — é um material de estudo.
 * Reúne, com comentários e exemplos executáveis, todos os conceitos de
 * PHP usados (e relacionados) ao CRUD de "Purchases" refatorado.
 *
 * COMO USAR:
 *   - Pelo terminal:   php main.php
 *   - Pelo navegador:  suba este arquivo num servidor PHP e acesse-o
 *                       (ele imprime tudo formatado como texto simples)
 *
 * Os exemplos de BANCO DE DADOS (seção 14) não são executados de
 * verdade — eles ficam dentro de comentários/strings, porque este
 * arquivo deve rodar sozinho, sem precisar de um MySQL configurado.
 * Use-os como referência de sintaxe.
 *
 * ÍNDICE
 *   1. Tags do PHP, comentários e saída de dados
 *   2. Variáveis, tipos e conversão de tipos
 *   3. Operadores
 *   4. Estruturas de controle (if/switch/match)
 *   5. Laços de repetição (for/while/do-while/foreach)
 *   6. Arrays
 *   7. Strings
 *   8. Funções
 *   9. Superglobais ($_GET, $_POST, $_SERVER, $_SESSION...)
 *  10. Formulários HTML + PHP
 *  11. Sessões
 *  12. Cookies
 *  13. include / require
 *  14. Banco de dados: mysqli x PDO + Prepared Statements
 *  15. Segurança essencial (SQL Injection, XSS, senhas)
 *  16. Tratamento de erros (try/catch)
 *  17. Orientação a objetos — noções básicas
 *  18. Data e hora
 *  19. Boas práticas rápidas
 * =======================================================================
 */

// Função só para deixar a "cola" organizada visualmente no terminal.
function secao(string $numero, string $titulo): void
{
    echo PHP_EOL . str_repeat('=', 74) . PHP_EOL;
    echo " {$numero}. {$titulo}" . PHP_EOL;
    echo str_repeat('=', 74) . PHP_EOL;
}


/* =======================================================================
 * 1. TAGS DO PHP, COMENTÁRIOS E SAÍDA DE DADOS
 * =======================================================================
 * Todo código PHP fica entre <?php e ?>. Fora dessas tags, tudo é
 * tratado como HTML puro (é assim que se mistura PHP com HTML nas
 * páginas do CRUD, como em home.php).
 *
 * Comentários:
 *   // comentário de uma linha
 *   #  também é comentário de uma linha (menos comum)
 *   /* comentário de várias linhas *\/
 *
 * Saída de dados:
 *   echo   -> imprime um ou mais valores (mais usado)
 *   print  -> parecido com echo, mas só aceita 1 valor e "retorna" 1
 *   printf / sprintf -> imprime/gera texto formatado (como %s, %d)
 *   var_dump() -> mostra o valor E o tipo de uma variável (ótimo p/ debug)
 *   print_r()  -> mostra o conteúdo de arrays/objetos de forma legível
 */
secao('1', 'Tags do PHP, comentários e saída de dados');

echo "Isso foi impresso com echo." . PHP_EOL;
printf("Pedido: %s | Valor: R$ %.2f" . PHP_EOL, 'Notebook', 3500.5);
var_dump(true);      // bool(true)
print_r(['a', 'b']); // Array ( [0] => a [1] => b )
echo PHP_EOL;


/* =======================================================================
 * 2. VARIÁVEIS, TIPOS E CONVERSÃO DE TIPOS
 * =======================================================================
 * Toda variável em PHP começa com $. PHP é "fracamente tipado": não é
 * preciso declarar o tipo, e o tipo pode mudar em tempo de execução.
 *
 * Tipos principais:
 *   string   'texto' ou "texto"
 *   int      42
 *   float    3.14
 *   bool     true / false
 *   array    [1, 2, 3]
 *   null     ausência de valor
 *
 * gettype($x)   -> devolve o tipo como string
 * (int) $x, (string) $x, (float) $x, (bool) $x -> conversão manual (cast)
 * is_int(), is_string(), is_array(), is_numeric() -> testam o tipo
 */
secao('2', 'Variáveis, tipos e conversão de tipos');

$nome = 'Maria';         // string
$idade = 25;              // int
$altura = 1.68;           // float
$estaAtivo = true;        // bool
$semValor = null;         // null

echo "Tipo de \$nome: " . gettype($nome) . PHP_EOL;
echo "Tipo de \$idade: " . gettype($idade) . PHP_EOL;

$textoNumero = "10";
$soma = $textoNumero + 5;               // PHP converte "10" para int automaticamente
echo "\"10\" + 5 = {$soma} (" . gettype($soma) . ')' . PHP_EOL;

$comoTexto = (string) 3.5;              // conversão manual (cast)
echo "float 3.5 convertido para string: '{$comoTexto}'" . PHP_EOL;

// is_numeric() é muito usado para validar campos de formulário
// (usamos isso em order_salvar.php para validar o campo "amount").
var_dump(is_numeric('3500.50')); // true
var_dump(is_numeric('abc'));     // false


/* =======================================================================
 * 3. OPERADORES
 * =======================================================================
 * Aritméticos:   +  -  *  /  %  **(potência)
 * Atribuição:    =  +=  -=  *=  /=  .=
 * Comparação:    ==  ===  !=  !==  <  >  <=  >=  <=>(spaceship)
 *   ==  compara só o VALOR (com conversão de tipo)
 *   === compara VALOR e TIPO (mais seguro, prefira sempre este)
 * Lógicos:       &&  ||  !   (e:  and / or  -- menos usados)
 * Concatenação:  .   (junta strings)
 * Ternário:      condição ? valorSeVerdadeiro : valorSeFalso
 * Null coalescing: $x ?? 'padrao'  -> usa 'padrao' se $x for null/indefinido
 *   Usadíssimo com dados de formulário: $_POST['nome'] ?? ''
 */
secao('3', 'Operadores');

var_dump(0 == 'abc');   // false no PHP 8 (mudou em relação ao PHP 7!)
var_dump('10' == 10);   // true  (mesmo VALOR, tipos diferentes)
var_dump('10' === 10);  // false (tipos diferentes: string x int)

$mensagem = empty($_GET['msg']) ? 'sem mensagem' : $_GET['msg'];
echo "Ternário: {$mensagem}" . PHP_EOL;

$emailDigitado = null;
$email = $emailDigitado ?? 'sem-email@exemplo.com';
echo "Null coalescing: {$email}" . PHP_EOL;
// É exatamente esse operador que usamos em includes/funcoes.php:
//   function h(?string $texto): string { return htmlspecialchars($texto ?? ''...); }


/* =======================================================================
 * 4. ESTRUTURAS DE CONTROLE
 * =======================================================================
 */
secao('4', 'Estruturas de controle (if / switch / match)');

$idadeExemplo = 20;
if ($idadeExemplo < 12) {
    echo "Criança" . PHP_EOL;
} elseif ($idadeExemplo < 18) {
    echo "Adolescente" . PHP_EOL;
} else {
    echo "Adulto" . PHP_EOL;
}

$diaSemana = 3;
switch ($diaSemana) {
    case 1:
        echo "Segunda" . PHP_EOL;
        break; // sem o break, o PHP continua executando os próximos "case"!
    case 3:
        echo "Quarta" . PHP_EOL;
        break;
    default:
        echo "Outro dia" . PHP_EOL;
}

// match (PHP 8+) é uma alternativa mais moderna ao switch:
// compara com === (estrito), não precisa de "break" e retorna um valor.
$situacao = match (true) {
    $diaSemana === 6, $diaSemana === 7 => 'Fim de semana',
    $diaSemana >= 1 && $diaSemana <= 5 => 'Dia útil',
    default => 'Inválido',
};
echo "match: {$situacao}" . PHP_EOL;


/* =======================================================================
 * 5. LAÇOS DE REPETIÇÃO
 * =======================================================================
 * for       -> quando já se sabe quantas vezes repetir
 * while     -> repete ENQUANTO a condição for verdadeira
 * do-while  -> igual o while, mas executa pelo menos 1 vez
 * foreach   -> percorre arrays (o mais usado no dia a dia com PHP+banco)
 */
secao('5', 'Laços de repetição (for / while / foreach)');

for ($i = 1; $i <= 3; $i++) {
    echo "for: volta {$i}" . PHP_EOL;
}

$contador = 0;
while ($contador < 3) {
    echo "while: contador = {$contador}" . PHP_EOL;
    $contador++;
}

// Este é o padrão usado em home.php / admin.php para listar resultados
// vindos do banco de dados:
$pedidosExemplo = [
    ['id' => 1, 'description' => 'Notebook', 'amount' => 3500.5],
    ['id' => 2, 'description' => 'Mouse',    'amount' => 79.9],
];
foreach ($pedidosExemplo as $pedido) {
    echo "foreach: #{$pedido['id']} - {$pedido['description']} - R$ {$pedido['amount']}" . PHP_EOL;
}


/* =======================================================================
 * 6. ARRAYS
 * =======================================================================
 * Indexado:       $x = [10, 20, 30];             // chaves 0,1,2 automáticas
 * Associativo:    $x = ['nome' => 'Ana', 'idade' => 30];
 * Multidimensional: array dentro de array (como $pedidosExemplo acima)
 *
 * Funções úteis:
 *   count($arr)              -> quantidade de itens
 *   in_array($valor, $arr)   -> valor existe no array?
 *   array_key_exists($k,$a)  -> chave existe no array?
 *   array_map($fn, $arr)     -> aplica uma função a cada item
 *   array_filter($arr, $fn)  -> filtra itens que passam numa condição
 *   sort($arr) / usort()     -> ordenar
 *   array_merge($a, $b)      -> junta dois arrays
 */
secao('6', 'Arrays');

$carrinho = ['Notebook', 'Mouse', 'Teclado'];
echo "Itens no carrinho: " . count($carrinho) . PHP_EOL;
var_dump(in_array('Mouse', $carrinho));

$cliente = ['nome' => 'Ana', 'email' => 'ana@exemplo.com'];
echo "Nome do cliente: {$cliente['nome']}" . PHP_EOL;

$precos = [10.0, 25.5, 99.9];
$comDesconto = array_map(fn($preco) => $preco * 0.9, $precos);
echo "Preços com 10% de desconto: " . implode(', ', $comDesconto) . PHP_EOL;

$caros = array_filter($precos, fn($preco) => $preco > 20);
echo "Preços acima de 20: " . implode(', ', $caros) . PHP_EOL;


/* =======================================================================
 * 7. STRINGS
 * =======================================================================
 *   strlen($s)             -> tamanho da string
 *   trim($s)                -> remove espaços do início/fim
 *   strtoupper()/strtolower()
 *   str_replace($de,$para,$s)
 *   explode($sep, $s)       -> string -> array
 *   implode($sep, $arr)     -> array -> string
 *   sprintf('%05.2f', $n)   -> formata número/texto
 *   number_format($n,2,',','.') -> formata número como "1.234,56"
 *   htmlspecialchars($s)    -> ESSENCIAL para segurança (seção 15)
 */
secao('7', 'Strings');

$frase = '  Olá, Mundo!  ';
echo "trim: '" . trim($frase) . "'" . PHP_EOL;
echo "maiúsculas: " . strtoupper($frase) . PHP_EOL;

$csv = 'notebook,mouse,teclado';
$itens = explode(',', $csv);
echo "explode: " . print_r($itens, true);
echo "implode de volta: " . implode(' | ', $itens) . PHP_EOL;

// Exatamente o que usamos em home.php/admin.php para mostrar valores em R$:
echo "number_format: R$ " . number_format(3500.5, 2, ',', '.') . PHP_EOL;


/* =======================================================================
 * 8. FUNÇÕES
 * =======================================================================
 * function nome(tipo $parametro = valorPadrao): tipoDeRetorno { ... }
 *
 * - Parâmetros podem ter valor padrão.
 * - Desde o PHP 7/8 é possível (e recomendado) tipar parâmetros e retorno.
 * - Arrow functions "fn(...) => expressão" são atalhos para funções
 *   pequenas de uma linha só (muito usadas com array_map/array_filter).
 */
secao('8', 'Funções');

function saudacao(string $nome, string $saudacaoInicial = 'Olá'): string
{
    return "{$saudacaoInicial}, {$nome}!";
}
echo saudacao('João') . PHP_EOL;
echo saudacao('Maria', 'Bom dia') . PHP_EOL;

// Igual à função h() de includes/funcoes.php do projeto refatorado:
function h(?string $texto): string
{
    return htmlspecialchars($texto ?? '', ENT_QUOTES, 'UTF-8');
}
echo h('<script>alert(1)</script>') . PHP_EOL;


/* =======================================================================
 * 9. SUPERGLOBAIS
 * =======================================================================
 * São arrays disponíveis automaticamente em QUALQUER lugar do código:
 *
 *   $_GET      -> dados enviados na URL (?msg=OK)
 *   $_POST     -> dados enviados por formulário (method="post")
 *   $_REQUEST  -> junta GET + POST + COOKIE (evite usar; prefira ser explícito)
 *   $_SESSION  -> dados guardados no servidor entre páginas (login)
 *   $_COOKIE   -> dados guardados no navegador do usuário
 *   $_SERVER   -> informações do servidor/requisição
 *                 (ex: $_SERVER['REQUEST_METHOD'] -> 'GET' ou 'POST')
 *   $_FILES    -> arquivos enviados via upload
 *
 * No CRUD refatorado usamos, por exemplo:
 *   if ($_SERVER['REQUEST_METHOD'] !== 'POST') { redirecionarPara('home.php'); }
 */
secao('9', 'Superglobais ($_GET, $_POST, $_SERVER, $_SESSION...)');

echo "Método da requisição atual: " . ($_SERVER['REQUEST_METHOD'] ?? 'CLI (sem HTTP)') . PHP_EOL;
echo "Exemplo de leitura seguindo padrão do projeto: " .
     "\$descricao = trim(\$_POST['description'] ?? '');" . PHP_EOL;


/* =======================================================================
 * 10. FORMULÁRIOS HTML + PHP
 * =======================================================================
 * <form action="processar.php" method="post">
 *     <input type="text" name="email">
 *     <button type="submit">Enviar</button>
 * </form>
 *
 * No processar.php:
 *   $email = $_POST['email'] ?? '';
 *
 * GET  -> dados aparecem na URL, indicado para filtros/buscas/paginação
 * POST -> dados vão no corpo da requisição, indicado para CRIAR/ALTERAR/
 *         EXCLUIR dados (é o que usamos em login, cadastro e no CRUD)
 *
 * isset($x)  -> a variável existe (mesmo que vazia)?
 * empty($x)  -> a variável está "vazia" (não existe, '', 0, null, [])? 
 * Sempre valide dados vindos de formulário ANTES de usar/gravar no banco.
 */
secao('10', 'Formulários HTML + PHP (GET x POST, isset/empty)');

echo "isset('') -> ";
var_dump(isset($frase)); // true, a variável existe
echo "empty('') -> ";
var_dump(empty(''));     // true, string vazia conta como "vazio"


/* =======================================================================
 * 11. SESSÕES
 * =======================================================================
 * session_start()  -> precisa ser chamado ANTES de qualquer saída HTML,
 *                     no início de toda página que usa $_SESSION.
 * $_SESSION['x'] = valor;   -> grava
 * $_SESSION['x'];            -> lê
 * unset($_SESSION['x']);     -> remove uma chave
 * session_destroy();         -> encerra a sessão inteira (logout)
 *
 * É assim que o sistema "lembra" que você está logado entre uma página
 * e outra: no login gravamos $_SESSION['id'], e todas as páginas
 * protegidas conferem se $_SESSION['id'] existe.
 */
secao('11', 'Sessões');

echo "// session_start();" . PHP_EOL;
echo "// \$_SESSION['id'] = \$cliente['id'];" . PHP_EOL;
echo "// \$_SESSION['name'] = \$cliente['name'];" . PHP_EOL;
echo "// unset(\$_SESSION['id']); session_destroy(); // logout" . PHP_EOL;


/* =======================================================================
 * 12. COOKIES
 * =======================================================================
 * Diferente da sessão (guardada no servidor), o cookie fica guardado no
 * navegador do usuário e pode ter um tempo de expiração definido.
 *
 *   setcookie('nome', 'valor', time() + 3600); // expira em 1 hora
 *   $_COOKIE['nome']  -> lê o valor (só disponível na PRÓXIMA requisição)
 *   setcookie('nome', '', time() - 3600);      // "apaga" o cookie
 *
 * O projeto não usa cookies diretamente (usa apenas sessão), mas é comum
 * usá-los para "lembrar-me" em telas de login, por exemplo.
 */
secao('12', 'Cookies');

echo "// setcookie('lembrar_email', \$email, time() + 86400*30);" . PHP_EOL;


/* =======================================================================
 * 13. INCLUDE / REQUIRE
 * =======================================================================
 *   include 'arquivo.php';       -> inclui; se o arquivo não existir,
 *                                    gera um AVISO (warning) e CONTINUA
 *   require 'arquivo.php';       -> inclui; se não existir, gera um ERRO
 *                                    FATAL e PARA a execução
 *   include_once / require_once  -> iguais aos acima, mas garantem que o
 *                                    mesmo arquivo não seja incluído 2x
 *                                    (evita erro de "função já declarada")
 *
 * Regra prática: use require_once para arquivos ESSENCIAIS (conexão com
 * banco, funções) — se faltarem, o sistema não deve continuar rodando
 * "quebrado" silenciosamente. É o padrão usado em todo o CRUD refatorado:
 *   require_once __DIR__ . '/includes/funcoes.php';
 *   require_once __DIR__ . '/includes/db.php';
 *
 * __DIR__ sempre aponta para a pasta do arquivo atual — usar __DIR__ nos
 * caminhos evita erros de "arquivo não encontrado" quando o mesmo código
 * é chamado a partir de pastas diferentes.
 */
secao('13', 'include / require / include_once / require_once');

echo "require_once __DIR__ . '/includes/db.php';" . PHP_EOL;


/* =======================================================================
 * 14. BANCO DE DADOS: mysqli x PDO + PREPARED STATEMENTS
 * =======================================================================
 * Existem duas formas "clássicas" de falar com MySQL em PHP:
 *
 * --- mysqli (usada no projeto ORIGINAL, sem prepared statements) -------
 *   $conexao = mysqli_connect('localhost', 'root', '', 'PurchasesDB');
 *   $query = "SELECT * FROM customers WHERE email='$email'"; // PERIGOSO!
 *   $resultado = mysqli_query($conexao, $query);
 *   while ($linha = mysqli_fetch_array($resultado)) { ... }
 *
 * --- PDO + prepared statements (usada no projeto REFATORADO) -----------
 *   $pdo = new PDO('mysql:host=localhost;dbname=PurchasesDB', 'root', '');
 *   $stmt = $pdo->prepare('SELECT * FROM customers WHERE email = ?');
 *   $stmt->execute([$email]);      // o valor vai separado da query
 *   $cliente = $stmt->fetch();     // um registro
 *   $clientes = $stmt->fetchAll(); // vários registros
 *
 * Por que PDO + prepared statement é melhor?
 *   1) Funciona com vários bancos (MySQL, PostgreSQL, SQLite...), não só
 *      MySQL — mysqli só funciona com MySQL/MariaDB.
 *   2) Os "?" (placeholders) impedem SQL Injection (seção 15).
 *   3) PDO pode ser configurado para lançar Exception em erros,
 *      facilitando o tratamento com try/catch (seção 16).
 *
 * INSERT / UPDATE / DELETE com PDO seguem o mesmo padrão:
 *   $stmt = $pdo->prepare('INSERT INTO orders (description, amount, customer_id) VALUES (?, ?, ?)');
 *   $stmt->execute([$descricao, $valor, $idCliente]);
 *
 *   $stmt = $pdo->prepare('UPDATE orders SET description = ? WHERE id = ?');
 *   $stmt->execute([$novaDescricao, $id]);
 *
 *   $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
 *   $stmt->execute([$id]);
 */
secao('14', 'Banco de dados: mysqli x PDO + Prepared Statements');
echo "(Sintaxe mostrada nos comentários do código-fonte deste arquivo.)" . PHP_EOL;
echo "Ver também: crud-refatorado/includes/db.php" . PHP_EOL;


/* =======================================================================
 * 15. SEGURANÇA ESSENCIAL
 * =======================================================================
 * (a) SQL INJECTION
 *     Nunca monte a query colando texto do usuário direto nela:
 *         "SELECT * FROM customers WHERE email='$email'"   // ERRADO
 *     Alguém poderia digitar, no campo de e-mail:
 *         ' OR '1'='1
 *     e a condição viraria sempre verdadeira.
 *     Use SEMPRE prepared statements (seção 14).
 *
 * (b) XSS (Cross-Site Scripting)
 *     Nunca jogue direto no HTML um texto que o usuário digitou:
 *         echo $pedido['description'];                      // ERRADO
 *     Se alguém cadastrar um pedido com a descrição
 *         <script>alert('hack')</script>
 *     esse script rodaria no navegador de quem visse a lista.
 *     Use sempre htmlspecialchars() antes de exibir:
 *         echo htmlspecialchars($pedido['description']);    // CERTO
 *
 * (c) SENHAS
 *     Nunca guarde senha em texto puro nem com md5()/sha1() sozinhos
 *     (são rápidos demais, o que ajuda quem tenta "quebrar" a senha).
 *     Use:
 *         $hash = password_hash($senha, PASSWORD_DEFAULT);   // ao cadastrar
 *         password_verify($senhaDigitada, $hash);             // ao logar
 *
 * (d) VALIDAÇÃO
 *     Sempre valide no servidor (PHP), mesmo que já valide no HTML
 *     (required, type="email"...). Validação só no navegador pode ser
 *     burlada facilmente.
 */
secao('15', 'Segurança essencial (SQL Injection, XSS, senhas)');

$senhaDigitada = 'minhasenha123';
$hashGuardadoNoBanco = password_hash($senhaDigitada, PASSWORD_DEFAULT);
echo "Hash gerado: {$hashGuardadoNoBanco}" . PHP_EOL;
var_dump(password_verify('minhasenha123', $hashGuardadoNoBanco)); // true
var_dump(password_verify('senhaErrada', $hashGuardadoNoBanco));   // false

$entradaPerigosa = "<script>alert('hack')</script>";
echo "Sem escapar (perigoso): {$entradaPerigosa}" . PHP_EOL;
echo "Escapado com htmlspecialchars: " . htmlspecialchars($entradaPerigosa) . PHP_EOL;


/* =======================================================================
 * 16. TRATAMENTO DE ERROS (try / catch / finally)
 * =======================================================================
 * try     -> bloco onde algo "arriscado" acontece (ex: conectar no banco)
 * catch   -> executado SE der erro (exception) dentro do try
 * finally -> executado sempre, dando erro ou não (opcional)
 * throw   -> usado para "lançar" um erro manualmente
 */
secao('16', 'Tratamento de erros (try/catch)');

function dividir(float $a, float $b): float
{
    if ($b === 0.0) {
        throw new InvalidArgumentException('Não é possível dividir por zero.');
    }
    return $a / $b;
}

try {
    echo dividir(10, 2) . PHP_EOL; // 5
    echo dividir(10, 0) . PHP_EOL; // gera exceção
} catch (InvalidArgumentException $e) {
    echo "Erro capturado: " . $e->getMessage() . PHP_EOL;
} finally {
    echo "Isso roda sempre, com ou sem erro." . PHP_EOL;
}

// É esse mecanismo que o PDO usa (seção 14): com
// PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, qualquer erro de SQL
// lança uma PDOException que pode ser capturada com try/catch.


/* =======================================================================
 * 17. ORIENTAÇÃO A OBJETOS — NOÇÕES BÁSICAS
 * =======================================================================
 * O CRUD refatorado é PROCEDURAL (funções soltas), de propósito, para
 * manter o código simples e didático. Mas é importante conhecer o
 * básico de classes, pois é o padrão em projetos maiores (frameworks
 * como Laravel são 100% orientados a objetos).
 *
 *   class NomeDaClasse {
 *       public tipo $propriedade;
 *
 *       public function __construct(tipo $valor) {
 *           $this->propriedade = $valor;
 *       }
 *
 *       public function metodo(): tipo {
 *           return $this->propriedade;
 *       }
 *   }
 *
 *   $objeto = new NomeDaClasse($valor);
 *   $objeto->metodo();
 */
secao('17', 'Orientação a objetos — noções básicas');

class Pedido
{
    public function __construct(
        public readonly string $descricao,
        public readonly float $valor
    ) {
    }

    public function valorFormatado(): string
    {
        return 'R$ ' . number_format($this->valor, 2, ',', '.');
    }
}

$pedidoObjeto = new Pedido('Notebook', 3500.5);
echo "{$pedidoObjeto->descricao}: {$pedidoObjeto->valorFormatado()}" . PHP_EOL;


/* =======================================================================
 * 18. DATA E HORA
 * =======================================================================
 *   date('d/m/Y')          -> string formatada com a data/hora atual
 *   date('d/m/Y H:i:s')    -> data e hora
 *   new DateTime('now')     -> objeto orientado a objetos p/ manipular datas
 *   strtotime('+1 day')     -> converte texto em timestamp
 */
secao('18', 'Data e hora');

echo "Hoje: " . date('d/m/Y') . PHP_EOL;
echo "Agora: " . date('d/m/Y H:i:s') . PHP_EOL;

$amanha = new DateTime('now');
$amanha->modify('+1 day');
echo "Amanhã: " . $amanha->format('d/m/Y') . PHP_EOL;


/* =======================================================================
 * 19. BOAS PRÁTICAS RÁPIDAS
 * =======================================================================
 *  - Um arquivo, uma responsabilidade (ver README.md: "arquitetura").
 *  - Nomes de variáveis e funções que expliquem o que fazem.
 *  - Nunca confie em dados vindos de $_GET/$_POST sem validar.
 *  - Sempre escape saída de dados do usuário com htmlspecialchars().
 *  - Sempre use prepared statements para falar com o banco.
 *  - Centralize configuração (ex: config.php) em vez de repetir a
 *    mesma senha/host em vários arquivos.
 *  - Separe "processar dados" de "mostrar HTML" sempre que possível.
 * =======================================================================
 */
secao('19', 'Boas práticas rápidas');
echo "Veja o README.md e a pasta crud-refatorado/ para ver esses pontos aplicados na prática." . PHP_EOL;

echo PHP_EOL . str_repeat('=', 74) . PHP_EOL;
echo " Fim da cola. Bons estudos!" . PHP_EOL;
echo str_repeat('=', 74) . PHP_EOL;
