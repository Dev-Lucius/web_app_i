# Guia — Apache e phpMyAdmin com XAMPP no Linux (Cinnamon/Mint)

Guia de referência rápida para instalar, rodar, diagnosticar problemas e
usar o Apache e o phpMyAdmin através do XAMPP, no Linux Mint com Cinnamon
(vale também para qualquer distro baseada em Ubuntu/Debian).

---

## 1. O que é cada peça

| Ferramenta | O que faz |
|---|---|
| **XAMPP** | Pacote que instala, juntos e já configurados, o Apache, o MySQL/MariaDB, o PHP e o phpMyAdmin em `/opt/lampp` |
| **Apache** | O servidor web — é ele quem "atende" o navegador quando você acessa `http://localhost` |
| **phpMyAdmin** | Uma interface visual (rodando dentro do próprio Apache) para gerenciar o banco de dados MySQL/MariaDB pelo navegador, sem precisar digitar comandos SQL na mão |

---

## 2. Instalação do XAMPP

```bash
# 1. Baixe o instalador (ajuste a versão se houver uma mais nova)
wget https://sourceforge.net/projects/xampp/files/XAMPP%20Linux/8.2.12/xampp-linux-x64-8.2.12-0-installer.run

# 2. Dê permissão de execução
chmod +x xampp-linux-x64-8.2.12-0-installer.run

# 3. Rode o instalador (abre um assistente gráfico)
sudo ./xampp-linux-x64-8.2.12-0-installer.run
```

Durante o assistente: deixe todos os componentes marcados (Apache, MySQL,
PHP, phpMyAdmin) e mantenha o caminho padrão de instalação, `/opt/lampp`.

---

## 3. Comandos essenciais (cola rápida)

```bash
sudo /opt/lampp/lampp start        # inicia Apache + MySQL + ProFTPD
sudo /opt/lampp/lampp startapache  # inicia só o Apache
sudo /opt/lampp/lampp startmysql   # inicia só o MySQL
sudo /opt/lampp/lampp stop         # para tudo
sudo /opt/lampp/lampp stopapache   # para só o Apache
sudo /opt/lampp/lampp restart      # reinicia tudo
sudo /opt/lampp/lampp status       # mostra o que está rodando de verdade
```

Painel de controle gráfico (com botões, se preferir a interface visual):

```bash
sudo /opt/lampp/manager-linux-x64.run
```

**Endereços de acesso depois que o Apache estiver rodando:**

| Endereço | O que abre |
|---|---|
| `http://localhost` | Página de boas-vindas do XAMPP |
| `http://localhost/phpmyadmin/` | Interface do phpMyAdmin |
| `http://localhost/nome-da-pasta-do-projeto/` | Seu projeto, se estiver dentro de `htdocs` |

---

## 4. O problema mais comum: conflito de porta com o Apache do sistema

O Linux Mint já vem (ou pode vir) com um Apache próprio instalado
(`apache2`), separado do Apache do XAMPP. Os dois brigam pela porta 80 —
só um consegue usá-la por vez.

**Sintoma:** `http://localhost` mostra uma página de erro `Not Found` com
a assinatura `Apache/2.x.x (Ubuntu)` no rodapé — sinal de que quem está
respondendo é o `apache2` do sistema, não o do XAMPP.

**Solução — pare e desative o Apache do sistema:**

```bash
sudo systemctl stop apache2
sudo systemctl disable apache2
```

> O `disable` é essencial: sem ele, o `apache2` do sistema volta a ligar
> sozinho no próximo boot do computador e o conflito volta.

Depois, reinicie o XAMPP para ele assumir a porta:

```bash
sudo /opt/lampp/lampp restart
```

Confirme quem está na porta 80:

```bash
sudo ss -tlnp | grep ':80 '
```

Deve aparecer o processo `httpd` (do XAMPP), não `apache2`.

> ⚠️ **Cuidado ao digitar esse comando:** um caractere extra colado sem
> querer no final (como um `~`) faz o `grep` não encontrar nada, mesmo
> com a porta ocupada — o comando vai retornar vazio e parecer que a
> porta está livre quando não está. Digite com atenção, sem nada colado
> depois do `:80`.

---

## 5. Se o Apache subir numa porta diferente de 80 (ex: 8080)

Às vezes, se a porta 80 já estava ocupada no momento da *instalação* do
XAMPP, o instalador configura o Apache para usar a porta **8080**
automaticamente, para não dar erro na hora de instalar.

**Sintoma:** `http://localhost` não funciona, mas `http://localhost:8080`
funciona normalmente.

**Solução — editar a configuração e voltar para a porta 80:**

```bash
# Veja as linhas atuais de porta
grep -n "Listen " /opt/lampp/etc/httpd.conf
grep -n "ServerName" /opt/lampp/etc/httpd.conf

# Edite o arquivo
sudo nano /opt/lampp/etc/httpd.conf
```

Dentro do `nano`, procure e troque:

```
Listen 8080              →   Listen 80
ServerName localhost:8080 →  ServerName localhost:80
```

Salve com `Ctrl+O`, `Enter`, e saia com `Ctrl+X`. Depois:

```bash
sudo /opt/lampp/lampp restart
sudo ss -tlnp | grep ':80 '
```

---

## 6. Diagnosticando quando o Apache não inicia (erro genérico)

Se `sudo /opt/lampp/lampp start` disser `Starting Apache...fail.`, siga
esta ordem — cada passo elimina uma possível causa:

```bash
# 1) A configuração tem erro de sintaxe?
sudo /opt/lampp/bin/httpd -t
# Resposta esperada: "Syntax OK"

# 2) O que diz o log de erro de verdade?
#    (repare: é error_log, com underline — não error.log)
sudo tail -50 /opt/lampp/logs/error_log

# 3) A porta 80 está mesmo livre?
sudo ss -tlnp | grep ':80 '

# 4) Rode em modo debug (primeiro plano) para ver o erro na hora
sudo /opt/lampp/bin/httpd -X
# Ctrl+C para encerrar depois de ver a mensagem
```

### Erro `(98) Address already in use` / `could not bind to address :::80`

Significa que **algum processo já está ocupando a porta 80**, mesmo que
o `lampp status` diga "Apache is not running". Isso costuma acontecer
quando sobra um processo "travado" de uma tentativa anterior de iniciar
o XAMPP, que não foi encerrado corretamente.

```bash
# Veja se sobrou algum processo velho do próprio XAMPP
ps aux | grep httpd

# Encerre à força
sudo pkill -9 -f /opt/lampp/bin/httpd

# Confirme que a porta ficou livre
sudo ss -tlnp | grep ':80 '

# Confirme também que o apache2 do sistema não voltou sozinho
sudo systemctl status apache2   # deve mostrar "inactive (dead)"

# Tente iniciar de novo
sudo /opt/lampp/lampp start
```

---

## 7. Tabela-resumo de sintomas e soluções

| Sintoma | Causa provável | Comando de solução |
|---|---|---|
| `Not Found` + assinatura `Apache/2.x (Ubuntu)` | `apache2` do sistema ocupando a porta 80 | `sudo systemctl stop apache2 && sudo systemctl disable apache2` |
| Funciona só em `localhost:8080` | XAMPP foi instalado com a porta 80 ocupada e caiu para 8080 | Editar `Listen`/`ServerName` em `httpd.conf` para `80` |
| `Starting Apache...fail.` + `Syntax OK` no teste | Porta ocupada por processo travado | `sudo pkill -9 -f /opt/lampp/bin/httpd` |
| `(98) Address already in use` | Outro processo (do XAMPP ou do sistema) preso na porta 80 | Ver seção 6 |
| `ss` não mostra nada, mas ainda dá erro de porta ocupada | Erro de digitação no comando (caractere extra colado, tipo `~`) | Repetir o comando com atenção, sem nada colado depois do `:80` |
| `Não foi possível conectar ao banco: SQLSTATE[HY000] [2002] No such file or directory` (fora do XAMPP) | PHP tentando achar o MySQL por um socket que não existe nesse caminho | Usar sempre o Apache/PHP/MySQL do próprio XAMPP (não misturar com instalação do sistema) |

---

## 8. Usando o phpMyAdmin

Com o Apache e o MySQL do XAMPP rodando (`sudo /opt/lampp/lampp status`
mostrando os dois como "running"):

1. Acesse `http://localhost/phpmyadmin/` no navegador.
2. Login padrão: usuário `root`, **sem senha** (campo em branco).
3. **Criar um banco de dados:** clique em **Novo**, no menu à esquerda,
   digite o nome (ex: `PurchasesDB`) e clique em **Criar**.
4. **Importar um schema pronto (arquivo `.sql`):** com o banco selecionado
   na lista à esquerda, clique na aba **Importar**, depois em
   **Escolher arquivo**, selecione o `.sql` e clique em **Executar**.
5. **Ver/editar dados de uma tabela:** clique no banco, depois na tabela
   desejada, e use as abas **Procurar**, **Estrutura**, **SQL** etc.
6. **Rodar uma consulta manual:** aba **SQL**, digite o comando e clique
   em **Executar**.

---

## 9. Colocando um projeto PHP para rodar

Os sites do XAMPP ficam na pasta `htdocs`. Para rodar um projeto:

```bash
# Copie a pasta do projeto para dentro do htdocs
sudo cp -r nome-do-projeto /opt/lampp/htdocs/

# Ajuste o dono da pasta para o seu usuário
# (evita precisar de sudo toda vez que for editar um arquivo)
sudo chown -R $USER:$USER /opt/lampp/htdocs/nome-do-projeto
```

Acesse pelo navegador em:

```
http://localhost/nome-do-projeto/
```

> Edite sempre os arquivos dentro de `/opt/lampp/htdocs/...` — é essa
> cópia que o Apache está servindo. Mudanças em outra cópia da pasta (por
> exemplo, a que você extraiu de um `.zip` em outro lugar) não aparecem
> no navegador.

---

## 10. Checklist de bom funcionamento

Antes de dar por resolvido, confira, nesta ordem:

- [ ] `sudo /opt/lampp/lampp status` mostra Apache **e** MySQL como *running*
- [ ] `sudo systemctl status apache2` mostra *inactive (dead)*
- [ ] `http://localhost` (sem porta) mostra a tela de boas-vindas do XAMPP
- [ ] `http://localhost/phpmyadmin/` abre normalmente
- [ ] O banco de dados do seu projeto aparece na lista do phpMyAdmin
- [ ] `http://localhost/nome-do-projeto/` carrega a aplicação
