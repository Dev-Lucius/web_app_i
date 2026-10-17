# Super Guia Definitivo de Node.js — dos Fundamentos à Produção

> Guia técnico e exaustivo, organizado em **8 módulos**, que cobre desde o funcionamento interno do runtime
> (V8, libuv, Event Loop) até arquitetura, segurança, testes, observabilidade, Docker e deploy.
> Todos os exemplos usam **JavaScript moderno (ES Modules)** e **TypeScript**.

Cada módulo segue a mesma estrutura:

1. **Conceito Teórico** — o "porquê" por trás da tecnologia, sem superficialidade.
2. **Exemplo de Código Prático** — snippets comentados, prontos para adaptar em produção.
3. **Dicas de Ouro / Anti-patterns** — o que fazer e o que **nunca** fazer.

---

## Panorama de versões (outubro de 2026)

O ecossistema muda rápido. Antes de começar, estas são as versões-alvo usadas no guia:

| Tecnologia | Situação / versão de referência |
|------------|----------------------------------|
| **Node.js 24** | LTS ativo (suporte até abril/2028) — **alvo recomendado para produção** |
| **Node.js 26** | Lançado em abril/2026; promovido a LTS em outubro/2026 |
| **Node.js 22** | LTS em manutenção (até abril/2027) |
| **Node.js 20** | **Fim de vida** (abril/2026) — não use em projetos novos |
| **Node.js 27+** | A partir do 27, passa a existir **1 release major por ano** e **toda release vira LTS** (fim do esquema par/ímpar) |
| **Express 5** | Versão estável atual (trata Promises rejeitadas automaticamente) |
| **Fastify 5** | Exige Node 20+ |
| **NestJS 12** | Pacotes prontos para ESM, validação via *Standard Schema*; exige Node 20.19+ ou 22.12+ |
| **Prisma 7** | Driver adapters obrigatórios; configuração do CLI em `prisma.config.ts` |
| **OWASP Top 10** | Edição **2025** (inclui "Software Supply Chain Failures") |

> **Importante:** números de versão e datas de suporte mudam. Confirme sempre em
> [nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases) e nas notas de
> release de cada biblioteca antes de fixar versões em um projeto real.

### Convenções do guia

- Código **ESM** (`import`/`export`) — `"type": "module"` no `package.json`.
- Imports de módulos nativos sempre com o prefixo **`node:`** (`node:fs`, `node:crypto`...): deixa explícito que
  é um módulo do core e evita colisão com pacotes do npm.
- Exemplos em TypeScript assumem `strict: true` no `tsconfig.json`.
- `await` de nível superior (*top-level await*) é usado livremente nos exemplos `.mjs`/ESM.

---

## Sumário

- [Módulo 1: Fundamentos e Arquitetura Interna](#módulo-1-fundamentos-e-arquitetura-interna)
- [Módulo 2: Gerenciamento de Pacotes e Ambiente](#módulo-2-gerenciamento-de-pacotes-e-ambiente)
- [Módulo 3: Programação Assíncrona e Manipulação de Dados](#módulo-3-programação-assíncrona-e-manipulação-de-dados)
- [Módulo 4: Construção de APIs e Ecossistema de Frameworks](#módulo-4-construção-de-apis-e-ecossistema-de-frameworks)
- [Módulo 5: Banco de Dados, ORMs e Persistência](#módulo-5-banco-de-dados-orms-e-persistência)
- [Módulo 6: Segurança e Boas Práticas (Production-Ready)](#módulo-6-segurança-e-boas-práticas-production-ready)
- [Módulo 7: Testes, Qualidade de Código e CI/CD](#módulo-7-testes-qualidade-de-código-e-cicd)
- [Módulo 8: Performance, Observabilidade e Deploy](#módulo-8-performance-observabilidade-e-deploy)
- [Apêndice A: Checklist de produção](#apêndice-a-checklist-de-produção)
- [Apêndice B: Roteiro de estudos e referências](#apêndice-b-roteiro-de-estudos-e-referências)

---

# Módulo 1: Fundamentos e Arquitetura Interna

## 1.1 Conceito Teórico

### O que é o Node.js

Node.js **não é** uma linguagem, nem um framework. É um **runtime** de JavaScript: um programa que embute um
motor JavaScript (o **V8**) e o conecta ao sistema operacional por meio de APIs de E/S (arquivos, rede,
processos, criptografia...). Em um navegador, o JavaScript conversa com o DOM; no Node, conversa com o sistema.

```text
┌──────────────────────────────────────────────────────────────┐
│                    SEU CÓDIGO (JS / TS)                      │
├──────────────────────────────────────────────────────────────┤
│        Módulos nativos: fs · http · net · crypto · stream    │
│        worker_threads · zlib · dns · child_process · ...     │
├──────────────────────────────────────────────────────────────┤
│                  Bindings em C++ (Node core)                 │
├───────────────────────────────┬──────────────────────────────┤
│   V8 (motor JavaScript)       │   libuv (E/S assíncrona,     │
│   compila e executa o JS,     │   Event Loop, thread pool)   │
│   gerencia a memória (GC)     │                              │
├───────────────────────────────┴──────────────────────────────┤
│  Outras libs: OpenSSL · llhttp (parser HTTP) · nghttp2 ·     │
│  c-ares (DNS) · zlib · undici (fetch)                        │
├──────────────────────────────────────────────────────────────┤
│        Sistema operacional (epoll / kqueue / IOCP)           │
└──────────────────────────────────────────────────────────────┘
```

| Componente | Responsabilidade |
|------------|------------------|
| **V8** | Compilar e executar JavaScript; coletor de lixo; estruturas de dados internas |
| **libuv** | Event Loop, E/S assíncrona multiplataforma, *thread pool*, timers |
| **Bindings C++** | Ponte entre o JavaScript e libuv/OpenSSL/zlib etc. |
| **APIs do Node** | `fs`, `http`, `crypto`, `stream`... a "biblioteca padrão" |
| **npm / ecossistema** | Milhões de pacotes (fora do runtime em si) |

### Como o motor V8 funciona

O V8 é o motor JavaScript/WebAssembly do Google Chrome, escrito em C++. Ele **não interpreta** JavaScript de
forma ingênua: usa um pipeline de compilação em camadas (*tiered compilation*).

```text
Código-fonte → Parser → AST → Ignition (interpretador de bytecode)
                                  │  funções "quentes" (muito executadas)
                                  ▼
                        Sparkplug  (compilador baseline, rápido de gerar)
                                  ▼
                        Maglev     (otimizador intermediário)
                                  ▼
                        TurboFan   (otimizador agressivo → código de máquina)
                                  │  suposição quebrada (ex.: tipo mudou)
                                  ▼
                        DESOTIMIZAÇÃO (volta para as camadas anteriores)
```

Conceitos-chave:

- **JIT (Just-In-Time):** o código é otimizado *enquanto o programa roda*, com base em como ele é de fato usado
  (*feedback de tipos*).
- **Hidden classes (shapes):** objetos com as mesmas propriedades, criadas na **mesma ordem**, compartilham uma
  "forma" interna. Isso permite acessar `obj.x` quase como um deslocamento fixo em memória.
- **Inline caches:** o V8 memoriza os tipos que viu em cada ponto de acesso. Código **monomórfico** (um só tipo)
  é muito rápido; **polimórfico/megamórfico** (vários tipos) é lento.
- **Desotimização:** se o TurboFan assumiu que `soma(a, b)` só recebia números e de repente chega uma string, o
  código otimizado é descartado.

**Coleta de lixo (GC)** — o V8 usa um coletor **geracional**:

| Região | Conteúdo | Algoritmo | Custo |
|--------|----------|-----------|-------|
| **Young generation** (*new space*) | Objetos recém-criados | *Scavenge* (cópia) | Muito rápido, frequente |
| **Old generation** (*old space*) | Objetos que sobreviveram a coletas | *Mark-Sweep-Compact* (incremental/concorrente) | Mais caro, menos frequente |
| **Fora do heap do V8** | `Buffer`/`ArrayBuffer`, memória nativa | Gerenciado pelo Node | Conta como memória do processo, não do heap JS |

> **Consequência prática:** alocar muitos objetos de vida curta é barato; **reter** objetos (caches, closures,
> listeners) empurra tudo para a *old generation* e aumenta o tempo de pausa do GC.

### Arquitetura assíncrona e não-bloqueante de E/S

Operações de E/S (ler arquivo, consultar banco, chamar uma API) são **milhares de vezes mais lentas** que
operações de CPU. Há duas formas de lidar com a espera:

| Modelo | Como funciona | Custo |
|--------|---------------|-------|
| **Bloqueante, uma thread por requisição** (Apache clássico, Java servlets tradicionais) | A thread **fica parada** esperando o disco/rede | Memória por thread (~MBs), troca de contexto, limite de conexões |
| **Não-bloqueante, orientado a eventos** (Node.js) | A thread **dispara** a operação, segue trabalhando e é **notificada** quando termina | Uma thread atende milhares de conexões; CPU pesado bloqueia todo mundo |

Analogia: um garçom que anota o pedido, entrega à cozinha e **já atende a próxima mesa** (Node) versus um garçom
que fica parado olhando a cozinha até o prato ficar pronto (bloqueante).

```js
// ESM — comparação bloqueante x não-bloqueante
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

// BLOQUEANTE: nada mais roda no processo enquanto o arquivo é lido
const dados1 = readFileSync("./grande.log");

// NÃO-BLOQUEANTE: a leitura vai para o sistema; o Event Loop continua livre
const dados2 = await readFile("./grande.log");
```

> **De onde vem a "não-bloqueância"?** De duas fontes: (1) **E/S de rede** usa mecanismos do kernel
> (`epoll` no Linux, `kqueue` no macOS/BSD, `IOCP` no Windows) — sem threads; (2) operações **sem API assíncrona
> no kernel** (sistema de arquivos, parte do DNS, criptografia, zlib) são executadas no **thread pool** do libuv.

### O Event Loop em detalhe

O Event Loop é o laço que decide **qual callback executar a seguir**. Ele é implementado pelo **libuv**, e o
código JavaScript do usuário roda sempre em **uma única thread** (a *main thread*).

Cada volta do loop (*tick*) passa por **fases**, sempre nesta ordem:

```text
   ┌───────────────────────────┐
┌─>│         1. Timers         │  setTimeout / setInterval vencidos
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │  2. Pending Callbacks     │  callbacks de E/S adiados (ex.: alguns erros TCP)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │  3. Idle, Prepare         │  uso interno do libuv
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   conexões,   │
│  │  4. Poll                  │<─────┤   dados, etc. │
│  └─────────────┬─────────────┘      └───────────────┘
│  ┌─────────────┴─────────────┐
│  │  5. Check                 │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤  6. Close Callbacks       │  socket.on('close'), etc.
   └───────────────────────────┘

   Entre CADA callback (e entre as fases): fila de process.nextTick → fila de microtasks (Promises)
```

| # | Fase | O que executa |
|---|------|---------------|
| 1 | **Timers** | Callbacks de `setTimeout`/`setInterval` cujo tempo já expirou (o tempo é um **mínimo**, não uma garantia) |
| 2 | **Pending Callbacks** | Callbacks de E/S que o ciclo anterior adiou |
| 3 | **Idle, Prepare** | Operações internas do libuv |
| 4 | **Poll** | Calcula quanto tempo pode bloquear esperando E/S; executa os callbacks de E/S (leitura de socket, fim de `fs.readFile`...). Se não há nada pendente e há `setImmediate`, segue para *Check*; se há timers próximos, espera até eles |
| 5 | **Check** | Callbacks de `setImmediate` |
| 6 | **Close Callbacks** | Eventos `'close'` (`socket.destroy()`, etc.) |

**As duas filas "VIP" fora das fases:**

1. **`process.nextTick` queue** — roda *imediatamente após a operação atual*, antes de qualquer Promise.
2. **Microtask queue** (`Promise.then`, `queueMicrotask`, `await`) — roda logo após a fila de `nextTick`.

Ambas são **esvaziadas completamente** entre os callbacks. Por isso, uma recursão infinita em
`process.nextTick` ou em Promises **trava o Event Loop** (*starvation*): as fases nunca avançam.

#### Exemplo 1 — ordem de execução (dentro de um callback de E/S)

```js
// ordem-event-loop.mjs
import { readFile } from "node:fs";

readFile(import.meta.filename, () => {
  console.log("A. callback de E/S (fase Poll)");

  setTimeout(() => console.log("D. setTimeout 0   (Timers — próxima volta)"), 0);
  setImmediate(() => console.log("C. setImmediate  (Check — mesma volta)"));
  Promise.resolve().then(() => console.log("B2. microtask (Promise)"));
  process.nextTick(() => console.log("B1. process.nextTick"));
});

// Saída (determinística): A → B1 → B2 → C → D
```

Dentro de um callback de E/S, `setImmediate` **sempre** executa antes de `setTimeout(…, 0)`, porque a fase
*Check* vem logo depois da *Poll*, e os *Timers* só voltam na próxima volta.

#### Exemplo 2 — escopo de módulo (cuidado com ESM!)

```js
console.log("1. síncrono");

setTimeout(() => console.log("4. setTimeout 0"), 0);
setImmediate(() => console.log("5. setImmediate"));
Promise.resolve().then(() => console.log("2. Promise.then"));
process.nextTick(() => console.log("3. nextTick"));

// Em ESM (.mjs / "type": "module"): 1 → 2 → 3 → (4 e 5 em ordem NÃO garantida)
// Em CommonJS:                       1 → 3 → 2 → (4 e 5 em ordem NÃO garantida)
```

Pontos sutis:

- Em **CommonJS**, `nextTick` roda antes das Promises. Em **ESM**, o módulo inteiro é avaliado dentro de uma
  *microtask*, então, **no escopo de topo do módulo**, a Promise tende a rodar antes do `nextTick`.
  Dentro de callbacks de E/S ou de timers, `nextTick` volta a vir primeiro.
- No escopo principal, `setTimeout(fn, 0)` vs `setImmediate(fn)` **não tem ordem garantida** (depende do
  desempenho do processo). Dentro de um callback de E/S, a ordem é garantida.

#### Exemplo 3 — bloqueando o Event Loop (o erro nº 1 em Node)

```js
import http from "node:http";

http
  .createServer((req, res) => {
    if (req.url === "/bloqueia") {
      const fim = Date.now() + 5_000;
      while (Date.now() < fim) {}               // CPU 100% por 5s: NADA mais responde
      return res.end("terminei\n");
    }
    res.end("pong\n");                          // /ping fica preso se /bloqueia estiver rodando
  })
  .listen(3000);
```

Enquanto `/bloqueia` roda, **todas** as outras requisições ficam na fila — porque só há uma thread executando
JavaScript. A solução é tirar o trabalho pesado da main thread (Workers, seção 1.3).

### O papel do libuv

O **libuv** é a biblioteca C que dá ao Node:

- o **Event Loop** e as fases descritas acima;
- abstração multiplataforma sobre `epoll`/`kqueue`/`IOCP` para **E/S de rede**;
- o **thread pool** (padrão: **4 threads**) para operações que não têm versão assíncrona nativa no sistema:

| Vai para o thread pool | **Não** usa o thread pool |
|------------------------|----------------------------|
| `fs.*` (quase tudo) | E/S de rede (TCP, UDP, HTTP) — usa o kernel |
| `crypto.pbkdf2`, `scrypt`, `randomBytes`, `randomFill` | Timers |
| `zlib` (gzip, brotli) | `process.nextTick` e Promises |
| `dns.lookup` (resolve via `getaddrinfo`) | `child_process` (processos separados) |

O tamanho do pool é controlado por `UV_THREADPOOL_SIZE` (máximo 1024), **definido antes do processo iniciar**.

```js
// thread-pool.mjs — rode:  node thread-pool.mjs   e depois:  UV_THREADPOOL_SIZE=8 node thread-pool.mjs
import { pbkdf2 } from "node:crypto";

const inicio = Date.now();

for (let i = 1; i <= 8; i++) {
  pbkdf2("senha", "sal", 600_000, 64, "sha512", () => {
    console.log(`hash ${i} concluído em ${Date.now() - inicio} ms`);
  });
}
// Com pool padrão (4): os 4 primeiros terminam juntos; os 4 seguintes ~2x mais tarde.
// Com UV_THREADPOOL_SIZE=8 (e ≥ 8 núcleos de CPU): todos terminam praticamente juntos.
```

> Aumentar o pool **além do número de núcleos** de CPU não acelera tarefas de CPU (como `pbkdf2`); só ajuda
> quando há muita E/S de arquivo simultânea.

### Modelo de concorrência: Event Loop single-thread vs Worker Threads

> **Node é "single-threaded"?** Seu **JavaScript** roda em uma thread. O **processo** Node, porém, tem várias
> threads (V8 para GC e compilação, libuv thread pool, etc.).

| Mecanismo | O que é | Memória | Quando usar |
|-----------|---------|---------|-------------|
| **Event Loop (padrão)** | 1 thread de JS + E/S assíncrona | 1 heap | **E/S intensiva**: APIs, proxies, gateways, WebSockets |
| **`worker_threads`** | Threads com **seu próprio** V8 isolate e Event Loop, no mesmo processo | Heaps separados; pode compartilhar `SharedArrayBuffer` | **CPU intensiva**: compressão, hash/criptografia síncrona, parsing pesado, processamento de imagem, cálculo |
| **`cluster`** | Vários **processos** Node compartilhando a mesma porta | Heaps totalmente separados | Usar todos os núcleos com um servidor HTTP stateless |
| **`child_process`** | Processo externo (qualquer programa) | Isolado | Executar binários (`ffmpeg`, `git`), isolar código instável |

**Regra de decisão:**

```text
A tarefa passa a maior parte do tempo ESPERANDO (rede, disco, banco)?
   └── sim → async/await no Event Loop. Não precisa de threads.
A tarefa passa a maior parte do tempo CALCULANDO (CPU)?
   ├── dura < ~1 ms por requisição → pode ficar na main thread
   ├── dura mais, é frequente      → pool de Worker Threads (ex.: Piscina)
   └── dura muito, é assíncrona    → fila de jobs (BullMQ) + workers dedicados / outro serviço
Precisa usar todos os núcleos com o MESMO servidor HTTP?
   └── cluster / PM2 / várias réplicas em contêineres
```

## 1.2 Exemplos de Código Prático

### Worker Thread básico (ESM)

```js
// fib.worker.mjs — executa em outra thread
import { parentPort, workerData } from "node:worker_threads";

const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));   // propositalmente custoso

parentPort.postMessage(fib(workerData.n));
```

```js
// principal.mjs
import { Worker } from "node:worker_threads";

function fibEmWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./fib.worker.mjs", import.meta.url), {
      workerData: { n },
    });

    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (codigo) => {
      if (codigo !== 0) reject(new Error(`Worker encerrou com código ${codigo}`));
    });
  });
}

// As 3 chamadas rodam em PARALELO em threads diferentes; o Event Loop principal segue livre
const resultados = await Promise.all([fibEmWorker(40), fibEmWorker(41), fibEmWorker(42)]);
console.log(resultados);
```

### Pool de Workers com Piscina (TypeScript) — o jeito de produção

Criar um `Worker` por requisição é caro (cada um inicia um V8 isolate novo). Em produção use um **pool**.

```ts
// src/workers/hash-pesado.ts — roda no worker (export default = função que o pool executa)
import { pbkdf2Sync } from "node:crypto";

export interface Entrada {
  senha: string;
  sal: string;
}

export default function hashPesado({ senha, sal }: Entrada): string {
  return pbkdf2Sync(senha, sal, 600_000, 64, "sha512").toString("hex");
}
```

```ts
// src/servicos/pool.ts — a thread principal
import Piscina from "piscina";
import os from "node:os";

export const pool = new Piscina({
  filename: new URL("../workers/hash-pesado.js", import.meta.url).href, // arquivo JÁ compilado
  maxThreads: Math.max(1, os.availableParallelism() - 1),             // deixa 1 núcleo para o Event Loop
});

// uso em uma rota:  const hash = await pool.run({ senha, sal });
```

### Memória compartilhada entre threads

```js
// contador.mjs — SharedArrayBuffer + Atomics evitam condições de corrida
import { Worker, isMainThread, workerData } from "node:worker_threads";

if (isMainThread) {
  const sab = new SharedArrayBuffer(4);
  const contador = new Int32Array(sab);

  const workers = Array.from({ length: 4 }, () => new Worker(import.meta.filename, { workerData: sab }));
  await Promise.all(workers.map((w) => new Promise((ok) => w.once("exit", ok))));

  console.log("total:", Atomics.load(contador, 0));   // sempre 400000
} else {
  const contador = new Int32Array(workerData);
  for (let i = 0; i < 100_000; i++) Atomics.add(contador, 0, 1);  // incremento atômico
}
```

### Observando memória e GC

```js
import { getHeapStatistics } from "node:v8";

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const m = process.memoryUsage();

console.log({
  rss: mb(m.rss),                 // memória total do processo
  heapUsed: mb(m.heapUsed),       // heap JS em uso
  heapTotal: mb(m.heapTotal),
  external: mb(m.external),       // memória C++ ligada a objetos JS (ex.: Buffers)
  limiteHeap: mb(getHeapStatistics().heap_size_limit),
});
// Aumentar o limite do heap:  node --max-old-space-size=4096 app.js
```

### Código amigável ao V8 (formas estáveis)

```js
// ✅ Mesma ordem de propriedades → mesma hidden class → inline cache monomórfico
class Ponto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// ❌ Formas diferentes para "o mesmo" conceito → código polimórfico/megamórfico
const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };            // ordem diferente = hidden class diferente
const c = { x: 3, y: 4 };
c.z = 5;                             // adicionar propriedades depois cria outra forma
delete c.x;                          // 'delete' degrada o objeto para modo dicionário (lento)
```

## 1.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Meça o *lag* do Event Loop** em produção (Módulo 8). É o termômetro mais honesto da saúde de um serviço Node.
- Use **`async/await`** com APIs assíncronas (`fs/promises`, drivers de banco) em todo caminho de requisição.
- Reserve `*Sync` (`readFileSync`, `execSync`...) para **scripts de inicialização** (ler config antes de subir o servidor).
- Para CPU pesada, use **pool** de Workers (Piscina) ou **fila de jobs** (BullMQ) — nunca um Worker novo por requisição.
- Defina `--max-old-space-size` **de acordo com o limite de memória do contêiner** (regra prática: ~75% do limite).
- Mantenha objetos com **formato estável** em caminhos quentes (mesmas propriedades, mesma ordem, sem `delete`).

**❌ Nunca faça**

- **Bloquear o Event Loop** em rotas: `for` gigante, `JSON.parse`/`JSON.stringify` de payloads enormes,
  `crypto.pbkdf2Sync`, regex com **backtracking catastrófico** (ReDoS), `readFileSync` por requisição.
- Fazer **recursão infinita** com `process.nextTick` ou Promises (fome do Event Loop).
- Assumir que `setTimeout(fn, 100)` executa em **exatamente** 100 ms (é um *mínimo*; o loop pode estar ocupado).
- Achar que "Node é single-thread, então não tem condição de corrida": com `async/await`, o **estado
  compartilhado** (variáveis de módulo, caches) pode ser alterado entre dois `await`.
- Usar Node para trabalho **predominantemente de CPU** sem estratégia (processamento de vídeo, ML pesado, cálculos
  científicos longos) — considere Workers, serviços em outra linguagem ou filas.
- Subir `UV_THREADPOOL_SIZE` para 1024 "por garantia": mais threads que núcleos só aumenta troca de contexto.

---

# Módulo 2: Gerenciamento de Pacotes e Ambiente

## 2.1 Conceito Teórico

### O ecossistema de gerenciadores de pacotes

Um gerenciador de pacotes resolve **dependências** (e as dependências delas), baixa os arquivos, grava um
**lockfile** com as versões exatas e executa **scripts**. Existem quatro ferramentas que você precisa conhecer:

| Ferramenta | O que é | Pontos fortes | Pontos de atenção |
|------------|---------|---------------|-------------------|
| **npm** | Gerenciador padrão (vem com o Node) | Universal, zero configuração, `npm ci`, *provenance*, workspaces | Mais lento e usa mais disco que pnpm; permite "dependências fantasma" |
| **Yarn** | Clássico (v1) e *Berry* (v2+) | Workspaces maduros; Berry tem **Plug'n'Play** (sem `node_modules`) e *constraints* | v1 está em manutenção; PnP exige compatibilidade das libs |
| **pnpm** | Armazena cada versão de cada pacote **uma única vez** (store global) e liga por *hard links* | Rápido, **economiza disco**, `node_modules` **estrito** (sem dependências fantasma), excelente para monorepos | Estrutura com symlinks pode quebrar ferramentas mal escritas |
| **npx** | Executa binários de pacotes (`npx prisma init`) sem instalar globalmente | Evita instalações globais | Equivalentes: `pnpm dlx`, `yarn dlx`, `npm exec` |

> **Dependência fantasma:** com `npm`/`yarn v1`, o `node_modules` é "achatado": seu código consegue importar
> um pacote que **não está** no seu `package.json` (só funciona porque outra dependência o instalou). Quando essa
> dependência indireta some, o seu código quebra. O pnpm impede isso por padrão.

**Recomendação prática:**

- Projeto individual/estudo → `npm` está ótimo.
- Equipe, monorepo ou CI com muitos projetos → `pnpm`.
- **Escolha um só** e imponha (campo `packageManager` + CI). Nunca misture lockfiles no mesmo projeto.

### Lockfiles: reprodutibilidade e segurança

| Gerenciador | Lockfile | Instalação "congelada" para CI |
|-------------|----------|--------------------------------|
| npm | `package-lock.json` | `npm ci` |
| Yarn | `yarn.lock` | `yarn install --immutable` |
| pnpm | `pnpm-lock.yaml` | `pnpm install --frozen-lockfile` |

O `package.json` declara **intervalos** de versão (`^4.18.0`); o **lockfile** registra a versão **exata** que foi
resolvida (com *hash* de integridade). Sem lockfile, duas máquinas instalam versões diferentes → *"na minha máquina
funciona"*.

**SemVer em 30 segundos** (`MAJOR.MINOR.PATCH`):

| Intervalo | Aceita | Exemplo (`1.2.3`) |
|-----------|--------|--------------------|
| `1.2.3` | Exata | só `1.2.3` |
| `~1.2.3` | Patches | `1.2.x` (≥ 1.2.3) |
| `^1.2.3` | Minors e patches | `1.x.x` (≥ 1.2.3) — padrão do npm |
| `*` / `latest` | Qualquer | **evite** |

**Regras de lockfile:**

1. **Sempre faça commit** do lockfile em aplicações (e em bibliotecas, para o CI).
2. Em CI/CD e Docker use o comando **congelado** (`npm ci`): falha se `package.json` e lockfile divergirem,
   apaga `node_modules` antes e é determinístico.
3. Revise o *diff* do lockfile em *pull requests* — é onde dependências suspeitas aparecem.
4. Atualize de forma **intencional** (Renovate/Dependabot), não por `npm install` descuidado.

### Segurança da cadeia de suprimentos (supply chain)

Pacotes do npm executam código na **sua máquina** e no **seu CI** (scripts `postinstall`). Ondas de ataques a
pacotes populares mostraram o risco. Em 2025, o OWASP passou a ter uma categoria própria para isso
(*Software Supply Chain Failures*). Defesas básicas:

- `npm audit` / `pnpm audit` no CI, falhando em vulnerabilidades altas/críticas.
- Instalar com `--ignore-scripts` quando possível (o **pnpm 10** já desabilita scripts de ciclo de vida de
  dependências por padrão — você libera só os necessários em `onlyBuiltDependencies`).
- **Fixar versões** críticas e usar `overrides` (npm) / `pnpm.overrides` para corrigir dependências transitivas vulneráveis.
- Desconfiar de pacotes novos, com poucos downloads, nomes parecidos com populares (*typosquatting*) ou
  mantenedores recém-trocados.
- Habilitar autenticação em duas etapas e **provenance** (`npm publish --provenance`) se você publica pacotes.
- Manter um **SBOM** (lista de componentes) em projetos críticos.

### Anatomia do `package.json`

| Campo | Função |
|-------|--------|
| `name`, `version` | Identidade (obrigatórios para publicar) |
| `private: true` | Impede publicação acidental no npm (use em aplicações) |
| `type` | `"module"` → `.js` é ESM; `"commonjs"` (padrão) → `.js` é CJS |
| `main` / `exports` | Ponto(s) de entrada ao fazer `import "seu-pacote"` — `exports` **tem prioridade** e encapsula o pacote |
| `imports` | Aliases internos (`"#db/*"`) — alternativa nativa a *path aliases* |
| `bin` | Executáveis expostos (CLI) |
| `files` | O que entra no pacote publicado |
| `scripts` | Comandos (`npm run dev`); ganchos `pre*`/`post*` |
| `dependencies` | Necessárias **em produção** |
| `devDependencies` | Só para desenvolvimento/build/testes (TypeScript, Vitest, ESLint) |
| `peerDependencies` | "O app hospedeiro precisa fornecer isto" (plugins, frameworks) |
| `optionalDependencies` | Se falhar a instalação, segue sem ela |
| `engines` | Versões de Node/gerenciador exigidas (alerta ou bloqueia, com `engine-strict`) |
| `packageManager` | Gerenciador e versão exatos (usado pelo Corepack) |
| `workspaces` | Monorepo (npm/yarn; no pnpm usa-se `pnpm-workspace.yaml`) |

**O campo `exports` com condições:**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.js"
  }
}
```

> Ordem importa: o Node usa a **primeira condição que casa**. `"types"` deve vir primeiro; `"default"` por último.

### Gerenciando versões do Node

Projetos diferentes exigem versões diferentes. **Nunca** dependa do Node "do sistema" (e evite `sudo npm -g`).

| Ferramenta | Plataforma | Observações |
|------------|-----------|-------------|
| **nvm** | Linux/macOS | O mais conhecido; lê `.nvmrc`; mais lento ao abrir o terminal |
| **nvm-windows** | Windows | Projeto **separado** do nvm (comandos parecidos, não idênticos) |
| **fnm** | Todas | Escrito em Rust, muito rápido; lê `.nvmrc` e `.node-version` |
| **Volta** | Todas | Fixa Node + gerenciador por projeto (`volta pin`) |

Camadas de proteção para garantir a versão correta:

1. **`.nvmrc`** (ou `.node-version`) → o dev troca com `nvm use` / `fnm use`.
2. **`engines`** no `package.json` + `engine-strict=true` no `.npmrc` → o `npm install` **falha** em versão errada.
3. **Imagem Docker** com a mesma versão (`FROM node:24-...`) e **CI** lendo o `.nvmrc`
   (`actions/setup-node` com `node-version-file`).

### Variáveis de ambiente seguras

Segundo o *Twelve-Factor App*, **configuração** (URLs, chaves, flags) vive no **ambiente**, não no código. Isso
permite o mesmo artefato rodar em dev, homologação e produção.

| Prática | Detalhe |
|---------|---------|
| **Nunca** versionar segredos | `.env` no `.gitignore`; versione apenas `.env.example` com chaves e valores fictícios |
| **Validar na inicialização** (*fail fast*) | Se faltar `DATABASE_URL`, o processo **não sobe** com erro claro, em vez de falhar horas depois |
| **Tipar** as variáveis | `process.env.X` é sempre `string \| undefined`; converta (`PORT`, booleanos) e exporte um objeto tipado |
| **Segredos reais** em produção | Gerenciador de segredos (AWS Secrets Manager, GCP Secret Manager, Vault, secrets do Kubernetes/Docker) — **não** arquivos `.env` no servidor |
| **Menor privilégio** | Cada serviço recebe só os segredos de que precisa; chaves distintas por ambiente |
| **Rotação** | Segredo vazado em log/commit = segredo **comprometido**: troque imediatamente |

Formas de carregar o `.env`:

| Forma | Observação |
|-------|-----------|
| `node --env-file=.env app.js` | **Nativo** (sem dependência). Várias flags são aceitas; o **último** arquivo sobrescreve os anteriores |
| `process.loadEnvFile(".env")` | **Nativo**, chamado em código |
| Pacote `dotenv` (`import "dotenv/config"`) | Clássico; necessário em ferramentas que não rodam via `node` direto (ex.: `prisma.config.ts`) |

> **Precedência:** variáveis **já definidas** no ambiente do processo (por exemplo, no contêiner) normalmente
> **vencem** as do arquivo no `dotenv`; no `--env-file` nativo, o arquivo **sobrescreve** variáveis lidas
> antes dele. Teste o comportamento na sua versão e documente a regra do projeto.

## 2.2 Exemplos de Código Prático

### `package.json` de uma API moderna (ESM + TypeScript)

```json
{
  "name": "api-biblioteca",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0 <27",
    "pnpm": ">=10"
  },
  "packageManager": "pnpm@10.0.0",
  "imports": {
    "#config/*": "./dist/config/*.js",
    "#modules/*": "./dist/modules/*.js"
  },
  "scripts": {
    "dev": "tsx watch --env-file=.env src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "prepare": "husky"
  },
  "dependencies": {
    "express": "^5.1.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^24.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["argon2", "esbuild"]
  }
}
```

> Os números de versão são ilustrativos: use `pnpm add <pacote>` / `npm install <pacote>` para gravar as
> versões atuais no seu projeto. Em produção, execute `node dist/server.js` (código **compilado**) — não use
> `tsx` nem `ts-node` em produção.

### `.npmrc` (npm) com guard-rails

```ini
engine-strict=true       # falha se a versão do Node não bater com "engines"
save-exact=false         # (opcional) true grava versões sem ^
audit-level=high         # npm audit só falha para high/critical
fund=false
```

### Trocando de versão do Node

```bash
# nvm
nvm install --lts          # instala a LTS mais recente
echo "24" > .nvmrc         # fixa a versão do projeto
nvm use                    # lê .nvmrc

# fnm
fnm install 24
fnm use                    # lê .nvmrc / .node-version

# Corepack: usa a versão do gerenciador declarada em "packageManager"
corepack enable
pnpm --version
```

> Corepack vem junto com versões de Node até a 24; a partir do Node 25 ele deixou de ser distribuído por
> padrão e passa a ser instalado separadamente (`npm i -g corepack`). Confira o que vale para a sua versão.

### Comandos do dia a dia

```bash
# instalar / adicionar
npm install                     # instala tudo
npm install express             # dependência de produção
npm install -D vitest typescript

# CI e produção
npm ci                          # reprodutível (usa o lockfile)
npm ci --omit=dev               # sem devDependencies (imagem Docker final)

# inspeção
npm ls express                  # por que/onde este pacote está instalado
npm outdated                    # o que tem versão nova
npm audit                       # vulnerabilidades conhecidas
npx npm-check-updates -i        # atualização interativa

# equivalentes em pnpm
pnpm install --frozen-lockfile
pnpm add express
pnpm add -D vitest
pnpm why express
pnpm dlx create-vite@latest
```

### Validação de variáveis de ambiente com Zod (TypeScript)

```ts
// src/config/env.ts
import { z } from "zod";

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),   // coerce: "3000" → 3000
  DATABASE_URL: z.url(),                                            // Zod 4 (no Zod 3: z.string().url())
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres"),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  // Fail fast: não sobe a aplicação com configuração inválida
  console.error("Variáveis de ambiente inválidas:\n" + z.prettifyError(resultado.error));
  process.exit(1);
}

export const env = Object.freeze(resultado.data);
export type Env = typeof env;
```

```ts
// uso — o resto do código importa "env", NUNCA process.env diretamente
import { env } from "./config/env.js";

console.log(`Servidor na porta ${env.PORT} (${env.NODE_ENV})`);
```

### Carregando o `.env` nativamente

```bash
# um arquivo
node --env-file=.env dist/server.js

# camadas (o último sobrescreve o anterior)
node --env-file=.env --env-file=.env.local dist/server.js
```

```js
// ou em código (ESM), sem dependências:
try {
  process.loadEnvFile(".env");
} catch {
  // em produção o arquivo normalmente não existe: as variáveis vêm do ambiente
}
```

### `.env.example` e `.gitignore`

```ini
# .env.example — versionado (sem segredos reais)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/biblioteca
JWT_SECRET=troque-por-uma-chave-aleatoria-com-32-caracteres-ou-mais
CORS_ORIGINS=http://localhost:5173
```

```text
# .gitignore
node_modules
dist
.env
.env.*
!.env.example
coverage
```

Gerar um segredo forte:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

### Monorepo com pnpm (visão geral)

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```bash
pnpm --filter api dev                 # roda o script "dev" só do app "api"
pnpm --filter "./packages/**" build   # builda todos os pacotes
pnpm -r test                          # roda "test" em todos os workspaces
```

```json
// apps/api/package.json — dependência interna
{
  "dependencies": {
    "@meu-org/validacao": "workspace:*"
  }
}
```

## 2.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Commite o lockfile** e use `npm ci` / `pnpm install --frozen-lockfile` em CI e Docker.
- Declare **`engines`** e **`packageManager`**; adicione `.nvmrc` e faça o CI ler dele.
- Separe `dependencies` de `devDependencies` corretamente — a imagem de produção instala **só** as primeiras.
- **Valide** as variáveis de ambiente na subida e exporte um objeto tipado e imutável (`env`).
- Mantenha um **`.env.example`** atualizado — é a documentação executável da configuração.
- Automatize atualizações com **Renovate/Dependabot** e rode `audit` no pipeline.
- Prefira os recursos **nativos** do Node (`--env-file`, `--watch`, `node:test`, `fetch`) antes de adicionar pacotes.

**❌ Nunca faça**

- **Commitar `.env`**, chaves de API ou tokens (mesmo "só por um minuto": o histórico do Git é permanente —
  se vazou, **troque o segredo**).
- Usar `sudo npm install -g`. Prefira `npx`, `pnpm dlx` ou instale ferramentas como devDependency do projeto.
- **Misturar gerenciadores** (`package-lock.json` + `yarn.lock` + `pnpm-lock.yaml` no mesmo repositório).
- Usar `latest`, `*` ou intervalos muito abertos em dependências de produção.
- Rodar `npm install` no Dockerfile/CI (use `npm ci`) ou apagar o lockfile "para resolver um conflito".
- Espalhar `process.env.ALGO` pelo código: centralize em **um módulo** de configuração.
- Importar pacotes que não estão no `package.json` (dependência fantasma).
- Colocar **segredos** em variáveis que o front-end empacota (`VITE_*`, `NEXT_PUBLIC_*`) — elas são **públicas**.
- Executar `tsx`/`ts-node` em produção: compile (`tsc`) e rode JavaScript puro.

---

# Módulo 3: Programação Assíncrona e Manipulação de Dados

## 3.1 Conceito Teórico

### A evolução assíncrona: Callbacks → Promises → `async/await`

Como o Node tem **uma thread de JavaScript**, toda operação lenta precisa ser **assíncrona**: você pede algo e
fornece "o que fazer quando terminar". A forma de expressar isso evoluiu em três gerações.

| Geração | Estilo | Problemas / vantagens |
|---------|--------|------------------------|
| **1. Callbacks** (2009+) | `fs.readFile(path, (err, data) => {...})` — convenção *error-first* | *Callback hell* (pirâmide de aninhamento), tratamento de erro repetido em cada nível, **inversão de controle** (quem chama decide *quando* e *quantas vezes* seu callback roda) |
| **2. Promises** (ES2015) | `readFile(path).then(...).catch(...)` | Encadeamento linear, **um** `catch` para a cadeia, composição (`all`, `race`...), garantia de *resolver uma única vez* |
| **3. `async/await`** (ES2017) | `const data = await readFile(path)` | Parece código síncrono, `try/catch` natural, stack traces melhores; **por baixo ainda são Promises** |

```js
// 1. Callback (error-first)
import { readFile } from "node:fs";
readFile("config.json", "utf8", (err, texto) => {
  if (err) return console.error(err);
  try {
    console.log(JSON.parse(texto));
  } catch (e) {
    console.error("JSON inválido", e);
  }
});

// 2. Promise
import { readFile as lerArquivo } from "node:fs/promises";
lerArquivo("config.json", "utf8")
  .then((texto) => JSON.parse(texto))
  .then((config) => console.log(config))
  .catch((erro) => console.error(erro));

// 3. async/await
try {
  const config = JSON.parse(await lerArquivo("config.json", "utf8"));
  console.log(config);
} catch (erro) {
  console.error(erro);
}
```

**Como `await` funciona:** uma função `async` sempre devolve uma Promise. Em cada `await`, a função é
**suspensa**, o controle volta ao Event Loop, e a continuação é agendada como **microtask** quando a Promise
resolve. Ou seja: `await` **não bloqueia a thread** — bloqueia apenas *aquela função*.

### Combinadores de Promises

| Método | Resolve quando... | Rejeita quando... | Usar para |
|--------|--------------------|-------------------|-----------|
| `Promise.all([...])` | **todas** resolvem (mantém a ordem) | **a primeira** rejeita | Tarefas independentes em que **tudo** é necessário |
| `Promise.allSettled([...])` | todas terminam (sucesso **ou** falha) | **nunca** | Processar lote tolerando falhas parciais |
| `Promise.race([...])` | a **primeira** termina | a primeira termina rejeitando | Timeouts |
| `Promise.any([...])` | a **primeira que resolve** | **todas** rejeitam (`AggregateError`) | Réplicas / fallback ("o mais rápido que funcionar") |
| `Promise.withResolvers()` | — | — | Criar Promise com `resolve`/`reject` expostos (Node 22+) |

### Sequencial × paralelo (o erro de performance mais comum)

```js
// ❌ SEQUENCIAL: tempo total = soma dos tempos (3 x 200 ms = 600 ms)
const usuario = await buscarUsuario(id);
const pedidos = await buscarPedidos(id);
const avaliacoes = await buscarAvaliacoes(id);

// ✅ PARALELO (se forem independentes): tempo total = o maior (≈ 200 ms)
const [usuario, pedidos, avaliacoes] = await Promise.all([
  buscarUsuario(id),
  buscarPedidos(id),
  buscarAvaliacoes(id),
]);
```

Mas **paralelo ilimitado** também é um erro: `Promise.all(10_000_000_ids.map(chamarApi))` abre dez mil conexões
de uma vez, estoura o pool do banco e derruba a API de terceiros. Use **concorrência limitada** (seção 3.2).

### Tratamento robusto de erros assíncronos

**1. Erros operacionais × erros de programação**

| Tipo | Exemplos | O que fazer |
|------|----------|-------------|
| **Operacionais** (esperados no mundo real) | Timeout de rede, arquivo inexistente, input inválido, banco indisponível | **Tratar**: retry, mensagem amigável, status HTTP adequado |
| **De programação** (bugs) | `undefined is not a function`, `await` esquecido, argumento errado | **Não "tratar"**: registrar, e deixar o processo cair e reiniciar (supervisor/orquestrador) |

**2. `try/catch` só captura o que é `await`ado (ou síncrono)**

```js
// ❌ O catch NÃO pega a rejeição: a Promise não foi aguardada
try {
  buscarDados();          // Promise "solta" (floating promise)
} catch (e) { /* nunca executa para erros assíncronos */ }

// ❌ Sem 'await' dentro do try, o catch também não executa
async function a() {
  try { return buscarDados(); }        // devolve a Promise sem aguardar
  catch (e) { /* ignorado! */ }
}

// ✅
async function b() {
  try { return await buscarDados(); }  // 'return await' DENTRO de try/catch é intencional
  catch (e) { /* agora sim */ }
}
```

**3. Eventos de nível de processo — a rede de segurança**

| Evento | Quando dispara | Comportamento no Node moderno |
|--------|----------------|-------------------------------|
| `unhandledRejection` | Promise rejeitada **sem** `catch` | Por padrão (Node ≥ 15) vira **exceção não capturada** e **derruba** o processo |
| `uncaughtException` | `throw` fora de qualquer `try/catch` | Derruba o processo, a menos que haja listener |
| `'error'` em `EventEmitter` sem listener | `emitter.emit("error", e)` | Vira `uncaughtException` |

> Depois de `uncaughtException`, o estado da aplicação é **desconhecido** (conexões pela metade, locks, caches
> inconsistentes). O padrão correto é: **logar → encerrar graciosamente → sair com código ≠ 0** e deixar o
> supervisor (PM2, Docker, Kubernetes) reiniciar. Não "engula" o erro e continue.

**4. Preserve a causa.** Ao relançar, use `new Error("mensagem", { cause: erroOriginal })` para não perder a stack
original.

**5. `fetch` não rejeita em HTTP 4xx/5xx** — só em falha de rede. Sempre verifique `response.ok`.

### Buffers: dados binários

Um **`Buffer`** é um bloco de bytes de tamanho fixo (subclasse de `Uint8Array`), alocado **fora do heap do V8**.
É a unidade com que o Node lê/escreve arquivos, sockets, criptografia e protocolos binários.

| API | Comportamento | Uso |
|-----|---------------|-----|
| `Buffer.alloc(n)` | Aloca `n` bytes **zerados** | Padrão seguro |
| `Buffer.allocUnsafe(n)` | Aloca **sem zerar** (pode conter lixo de memória antiga — dados de outros usuários!) | Só se você sobrescrever tudo imediatamente |
| `Buffer.from(string, enc)` | Cria a partir de texto (`utf8`, `hex`, `base64`, `base64url`, `latin1`...) | Conversões |
| `Buffer.from(array)` / `Buffer.from(arrayBuffer)` | A partir de bytes (a partir de `ArrayBuffer` **compartilha** memória) | Interoperar |
| `Buffer.concat([a, b])` | Junta buffers (copia) | Montar payloads |
| `buf.subarray(i, j)` | **Visão** (sem cópia) do mesmo bloco | Fatiar sem custo (cuidado: alterar a fatia altera o original) |
| `buf.toString(enc)` | Decodifica | Texto |
| `Buffer.byteLength(str)` | Bytes **reais** de uma string (≠ `str.length`) | `Content-Length` |
| `crypto.timingSafeEqual(a, b)` | Comparação em tempo constante | Comparar segredos/tokens/assinaturas |

> `new Buffer()` é **deprecado** (inseguro e ambíguo): use `Buffer.alloc`/`Buffer.from`.

### Streams: dados em fluxo

Uma **Stream** processa dados **em pedaços (*chunks*)**, em vez de carregar tudo na memória. É a abstração
central do Node: `fs`, `http`, `net`, `zlib`, `crypto` e `process.stdin/stdout` são streams.

| Tipo | Papel | Exemplos |
|------|-------|----------|
| **Readable** | Fonte de dados | `fs.createReadStream`, `req` (HTTP no servidor), `process.stdin` |
| **Writable** | Destino | `fs.createWriteStream`, `res` (HTTP no servidor), `process.stdout` |
| **Duplex** | Lê **e** escreve (lados independentes) | `net.Socket`, `tls.TLSSocket` |
| **Transform** | Duplex que **transforma** o dado que passa | `zlib.createGzip()`, `crypto.createCipheriv()`, parsers |

```text
 Readable ──chunk──▶ Transform ──chunk──▶ Transform ──chunk──▶ Writable
 (arquivo)           (parse CSV)          (gzip)               (arquivo .gz)
        ◀────────── backpressure (o destino lento "freia" a origem) ──────────
```

**Por que streams?**

| Cenário: arquivo de 2 GB | `readFile` | Stream |
|--------------------------|-----------|--------|
| Memória | ~2 GB (ou erro de alocação) | ~64 KB por *chunk* (constante) |
| Tempo até o 1º byte | Só depois de ler tudo | **Imediato** |
| Escala (muitas requisições) | Cada uma reserva GBs | Memória previsível |

**Backpressure** é o mecanismo que impede o produtor de afogar o consumidor: `writable.write(chunk)` retorna
`false` quando o buffer interno (`highWaterMark`, padrão **64 KiB** em streams de bytes nas versões atuais) está
cheio — o produtor deve **esperar o evento `'drain'`**. Usando `pipeline()`, tudo isso é tratado para você.

**`pipe()` × `pipeline()`:**

| | `a.pipe(b)` | `pipeline(a, b, c)` |
|---|-------------|----------------------|
| Backpressure | ✔ | ✔ |
| Propaga **erros** entre as etapas | ❌ | ✔ |
| **Destrói** as streams ao falhar (evita vazamento de descritores) | ❌ | ✔ |
| Versão com Promise | — | `node:stream/promises` |

**Modos:** streams de **bytes** (`Buffer`/`string`) × **`objectMode`** (cada *chunk* é um objeto JS qualquer —
útil para registros de banco, linhas parseadas). Todas as Readable são **async iterables**: `for await (const chunk of stream)`.

## 3.2 Exemplos de Código Prático

### Concorrência limitada (sem dependências)

```ts
// src/util/map-com-limite.ts
/**
 * Executa `fn` sobre os itens com no máximo `limite` tarefas simultâneas.
 * Preserva a ordem dos resultados. Se uma tarefa falhar, rejeita (como Promise.all).
 */
export async function mapComLimite<T, R>(
  itens: readonly T[],
  limite: number,
  fn: (item: T, indice: number) => Promise<R>,
): Promise<R[]> {
  const resultados = new Array<R>(itens.length);
  let proximo = 0;

  // Cada "trabalhador" pega o próximo índice livre até acabar a lista.
  // Não há condição de corrida: entre dois `await`, o JS é single-thread.
  const trabalhador = async (): Promise<void> => {
    while (true) {
      const i = proximo++;
      if (i >= itens.length) return;
      resultados[i] = await fn(itens[i]!, i);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
  return resultados;
}

// uso: 1000 chamadas, no máximo 10 ao mesmo tempo
// const perfis = await mapComLimite(ids, 10, (id) => api.buscarPerfil(id));
```

(Em projetos reais, o pacote **`p-limit`** / **`p-queue`** cobre esse caso com mais recursos.)

### Timeout e cancelamento com `AbortSignal`

```js
// fetch com timeout de 3s e cancelamento manual combinados
const controlador = new AbortController();
process.once("SIGTERM", () => controlador.abort());   // cancela se o processo for encerrado

const sinal = AbortSignal.any([controlador.signal, AbortSignal.timeout(3_000)]);

try {
  const resposta = await fetch("https://api.exemplo.com/dados", { signal: sinal });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);   // fetch NÃO rejeita em 4xx/5xx
  const dados = await resposta.json();
  console.log(dados);
} catch (erro) {
  if (erro.name === "TimeoutError") console.error("A API demorou demais");
  else if (erro.name === "AbortError") console.error("Operação cancelada");
  else throw erro;
}
```

### Retry com *backoff* exponencial e *jitter* (TypeScript)

```ts
// src/util/retry.ts
import { setTimeout as dormir } from "node:timers/promises";

interface OpcoesRetry {
  tentativas?: number;                          // total de tentativas (padrão 4)
  baseMs?: number;                              // atraso inicial (padrão 200 ms)
  maxMs?: number;                               // teto do atraso (padrão 5 s)
  deveTentarNovamente?: (erro: unknown) => boolean;
  sinal?: AbortSignal;
}

export async function comRetry<T>(
  operacao: (tentativa: number) => Promise<T>,
  { tentativas = 4, baseMs = 200, maxMs = 5_000, deveTentarNovamente = () => true, sinal }: OpcoesRetry = {},
): Promise<T> {
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await operacao(tentativa);
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa === tentativas || !deveTentarNovamente(erro)) break;

      const teto = Math.min(maxMs, baseMs * 2 ** (tentativa - 1));   // 200, 400, 800...
      const espera = Math.random() * teto;                           // "full jitter" evita rajadas sincronizadas
      await dormir(espera, undefined, { signal: sinal });
    }
  }
  throw ultimoErro;
}

// uso: só repete em falhas transitórias, nunca em erros de validação (4xx)
// const dados = await comRetry(() => api.buscar(id), {
//   deveTentarNovamente: (e) => e instanceof ErroDeRede || (e instanceof ErroHttp && e.status >= 500),
// });
```

> Só aplique retry em operações **idempotentes** (ou use uma chave de idempotência). Repetir um `POST /pagamentos`
> sem proteção pode cobrar duas vezes.

### Hierarquia de erros da aplicação (TypeScript)

```ts
// src/erros/app-error.ts
export class AppError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly operacional: boolean;       // true = erro esperado (cliente/negócio); false = bug

  constructor(
    mensagem: string,
    opcoes: { status?: number; codigo?: string; causa?: unknown; operacional?: boolean } = {},
  ) {
    super(mensagem, { cause: opcoes.causa });
    this.name = new.target.name;
    this.status = opcoes.status ?? 500;
    this.codigo = opcoes.codigo ?? "ERRO_INTERNO";
    this.operacional = opcoes.operacional ?? true;
  }
}

export class NaoEncontradoError extends AppError {
  constructor(recurso: string, id?: string) {
    super(id ? `${recurso} '${id}' não encontrado` : `${recurso} não encontrado`, {
      status: 404,
      codigo: "NAO_ENCONTRADO",
    });
  }
}

export class ConflitoError extends AppError {
  constructor(mensagem: string) {
    super(mensagem, { status: 409, codigo: "CONFLITO" });
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(mensagem = "Credenciais inválidas") {
    super(mensagem, { status: 401, codigo: "NAO_AUTORIZADO" });
  }
}

export class ProibidoError extends AppError {
  constructor(mensagem = "Sem permissão para esta operação") {
    super(mensagem, { status: 403, codigo: "PROIBIDO" });
  }
}

// Encapsular preservando a causa:
// try { await db.query(...) }
// catch (e) { throw new AppError("Falha ao consultar pedidos", { status: 503, causa: e, operacional: true }); }
```

### Rede de segurança do processo + encerramento gracioso

```ts
// src/processo.ts
import type { Server } from "node:http";

export function registrarEncerramento(servidor: Server, limpar: () => Promise<void>) {
  let encerrando = false;

  async function encerrar(motivo: string, codigo: number) {
    if (encerrando) return;
    encerrando = true;
    console.error(`[processo] encerrando por ${motivo}`);

    // Garante a saída mesmo se algo pendurar
    setTimeout(() => process.exit(1), 10_000).unref();

    try {
      await new Promise<void>((ok, falha) => servidor.close((e) => (e ? falha(e) : ok())));  // para de aceitar conexões
      await limpar();                                                                          // fecha pool de banco, filas...
    } finally {
      process.exit(codigo);
    }
  }

  process.on("SIGTERM", () => void encerrar("SIGTERM", 0));
  process.on("SIGINT", () => void encerrar("SIGINT", 0));

  process.on("unhandledRejection", (motivo) => {
    console.error("[processo] unhandledRejection:", motivo);
    void encerrar("unhandledRejection", 1);
  });

  process.on("uncaughtException", (erro) => {
    console.error("[processo] uncaughtException:", erro);
    void encerrar("uncaughtException", 1);
  });
}
```

### `util.promisify` e `events.once`

```js
import { promisify } from "node:util";
import { once } from "node:events";
import { createServer } from "node:http";
import { scrypt } from "node:crypto";

// Converte uma função com callback error-first em uma que devolve Promise
const scryptAsync = promisify(scrypt);
const chave = await scryptAsync("senha", "sal", 64);

// Aguarda um evento como se fosse uma Promise (rejeita se o emitter emitir 'error')
const servidor = createServer().listen(0);
await once(servidor, "listening");
console.log("porta:", servidor.address().port);
```

### Buffers na prática

```js
import { timingSafeEqual } from "node:crypto";

const a = Buffer.from("Olá, 世界", "utf8");
console.log(a.length, "bytes vs", "Olá, 世界".length, "caracteres");   // 11 bytes vs 8 caracteres
console.log(a.toString("hex"), a.toString("base64"), a.toString("base64url"));

// Fatiar sem copiar: alterar a fatia altera o original
const bytes = Buffer.from([1, 2, 3, 4]);
const fatia = bytes.subarray(1, 3);
fatia[0] = 99;
console.log(bytes);                      // <Buffer 01 63 03 04>

// Ler um protocolo binário: [versão:1][tipo:1][tamanho:4 (big-endian)][payload]
const pacote = Buffer.from([1, 7, 0, 0, 0, 5, 104, 101, 108, 108, 111]);
const quadro = {
  versao: pacote.readUInt8(0),
  tipo: pacote.readUInt8(1),
  tamanho: pacote.readUInt32BE(2),
};
console.log(quadro, pacote.subarray(6, 6 + quadro.tamanho).toString());   // { versao: 1, tipo: 7, tamanho: 5 } hello

// Comparação de segredos em tempo constante (evita timing attacks)
function tokensIguais(recebido, esperado) {
  const x = Buffer.from(recebido);
  const y = Buffer.from(esperado);
  return x.length === y.length && timingSafeEqual(x, y);   // timingSafeEqual exige tamanhos iguais
}
```

### Stream 1 — copiar e comprimir um arquivo gigante com `pipeline`

```js
// comprimir.mjs
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

try {
  await pipeline(
    createReadStream("./logs-2026.txt"),
    createGzip({ level: 6 }),
    createWriteStream("./logs-2026.txt.gz"),
  );
  console.log("Arquivo comprimido com memória constante.");
} catch (erro) {
  // pipeline já destruiu todas as streams (não vazam descritores de arquivo)
  console.error("Falha na compressão:", erro);
  process.exitCode = 1;
}
```

### Stream 2 — Transform customizado: CSV → NDJSON (TypeScript)

O problema clássico: um *chunk* pode terminar no **meio de uma linha** (ou até no meio de um caractere
multibyte). O `Transform` precisa guardar o "resto" entre chunks.

```ts
// src/streams/divisor-de-linhas.ts
import { Transform, type TransformCallback } from "node:stream";
import { StringDecoder } from "node:string_decoder";

/** Recebe bytes, emite UMA linha (string) por chunk de saída. */
export class DivisorDeLinhas extends Transform {
  #decoder = new StringDecoder("utf8");   // junta bytes de caracteres multibyte quebrados entre chunks
  #resto = "";

  constructor() {
    super({ readableObjectMode: true });  // entrada: bytes; saída: strings (objetos)
  }

  override _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback): void {
    const linhas = (this.#resto + this.#decoder.write(chunk)).split(/\r?\n/);
    this.#resto = linhas.pop() ?? "";     // a última "linha" pode estar incompleta
    for (const linha of linhas) this.push(linha);
    cb();
  }

  override _flush(cb: TransformCallback): void {
    const final = this.#resto + this.#decoder.end();
    if (final) this.push(final);
    cb();
  }
}
```

```ts
// src/streams/importar-vendas.ts
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { DivisorDeLinhas } from "./divisor-de-linhas.js";

let primeira = true;

const parseCsv = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(linha: string, _enc, cb) {
    if (primeira) { primeira = false; return cb(); }            // descarta o cabeçalho
    const [id, produto, valor] = linha.split(",");
    cb(null, { id: Number(id), produto, valor: Number(valor) });
  },
});

const paraNdjson = new Transform({
  writableObjectMode: true,
  transform(obj, _enc, cb) {
    cb(null, JSON.stringify(obj) + "\n");
  },
});

await pipeline(
  createReadStream("vendas.csv"),
  new DivisorDeLinhas(),
  parseCsv,
  paraNdjson,
  createGzip(),
  createWriteStream("vendas.ndjson.gz"),
);
```

### Stream 3 — exportar milhões de registros do banco sem estourar a memória

`Readable.from()` transforma um **gerador assíncrono** em stream. Combinado com paginação por *cursor*, a API
devolve dados enquanto ainda os busca.

```ts
// src/modules/livros/exportar.ts
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Request, Response, NextFunction } from "express";

interface Livro { id: string; titulo: string; isbn: string }

interface LivrosRepo {
  listarLote(apos: string | undefined, tamanho: number): Promise<Livro[]>;   // ORDER BY id, WHERE id > apos
}

async function* livrosEmLotes(repo: LivrosRepo, tamanho = 500): AsyncGenerator<Livro> {
  let cursor: string | undefined;
  while (true) {
    const lote = await repo.listarLote(cursor, tamanho);
    if (lote.length === 0) return;
    yield* lote;
    cursor = lote.at(-1)!.id;
  }
}

const paraNdjson = () =>
  new Transform({
    writableObjectMode: true,
    transform(obj, _enc, cb) { cb(null, JSON.stringify(obj) + "\n"); },
  });

export const exportarLivros = (repo: LivrosRepo) => async (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Content-Disposition", 'attachment; filename="livros.ndjson"');

  try {
    // Backpressure automática: se o cliente for lento, o banco deixa de ser consultado
    await pipeline(Readable.from(livrosEmLotes(repo)), paraNdjson(), res);
  } catch (erro) {
    // Cliente desconectou => ERR_STREAM_PREMATURE_CLOSE (esperado, não é bug)
    if ((erro as NodeJS.ErrnoException).code !== "ERR_STREAM_PREMATURE_CLOSE") next(erro);
  }
};
```

### Stream 4 — backpressure manual (e por que ignorá-la é um erro)

```js
// gerar-grande.mjs — escreve ~5 milhões de linhas respeitando o buffer
import { createWriteStream } from "node:fs";
import { once } from "node:events";

const saida = createWriteStream("grande.txt");

for (let i = 0; i < 5_000_000; i++) {
  const coube = saida.write(`linha ${i}\n`);
  if (!coube) await once(saida, "drain");     // ⏸ espera o buffer esvaziar antes de continuar
}

saida.end();
await once(saida, "finish");
console.log("arquivo gerado");

// ❌ Sem o `await once(saida, "drain")` o buffer interno cresce sem limite:
//    o processo consome centenas de MB (ou GBs) de RAM e pode ser morto por falta de memória.
```

### Stream 5 — benchmark de memória: `readFile` × stream

```js
// comparar-memoria.mjs  — rode:  node comparar-memoria.mjs
import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";

const mb = () => (process.memoryUsage().rss / 1024 / 1024).toFixed(0) + " MB";
const contarLinhas = (buf) => {
  let n = 0, i = -1;
  while ((i = buf.indexOf(10, i + 1)) !== -1) n++;   // 10 = '\n'
  return n;
};

console.log("início:", mb());

// 1) Carrega tudo na memória
const tudo = await readFile("grande.txt");
console.log("readFile  →", contarLinhas(tudo), "linhas | RSS:", mb());   // ≈ tamanho do arquivo + base

// 2) Em fluxo
let linhas = 0;
for await (const chunk of createReadStream("grande.txt")) linhas += contarLinhas(chunk);
console.log("stream    →", linhas, "linhas | RSS:", mb());               // RSS praticamente estável
```

> Rode as duas partes **em processos separados** para uma medição limpa (a memória do `readFile` continua
> reservada enquanto `tudo` estiver referenciado). O objetivo é ver a ordem de grandeza: ~tamanho do arquivo
> versus dezenas de MB.

### Stream 6 — Duplex e `PassThrough`

```js
// Um net.Socket é Duplex: o mesmo objeto lê e escreve. Aqui, um servidor "eco":
import net from "node:net";
import { PassThrough } from "node:stream";

net
  .createServer((socket) => {
    let bytes = 0;

    // PassThrough = Transform que não altera nada; ótimo para "espiar" o fluxo
    const medidor = new PassThrough();
    medidor.on("data", (c) => (bytes += c.length));

    socket.pipe(medidor).pipe(socket);                   // lê do cliente → mede → devolve ao cliente
    socket.on("close", () => console.log("cliente enviou", bytes, "bytes"));
    socket.on("error", (e) => console.error("socket:", e.code));
  })
  .listen(4000);
```

### Stream 7 — limitar o tamanho de um upload (segurança)

```ts
import { Transform, type TransformCallback } from "node:stream";

export class LimiteDeTamanho extends Transform {
  #total = 0;
  constructor(private readonly maxBytes: number) {
    super();
  }

  override _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback): void {
    this.#total += chunk.length;
    if (this.#total > this.maxBytes) {
      return cb(new Error(`Upload excede ${this.maxBytes} bytes`));   // pipeline aborta e limpa tudo
    }
    cb(null, chunk);
  }
}

// await pipeline(req, new LimiteDeTamanho(5 * 1024 * 1024), createWriteStream(destino));
```

## 3.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- Use **`async/await`** + `try/catch` e **sempre** `await` (ou `.catch`) em toda Promise. Ative a regra
  **`@typescript-eslint/no-floating-promises`** no ESLint — ela pega os `await` esquecidos.
- **Paralelize** o que é independente (`Promise.all`) e **limite a concorrência** de lotes grandes.
- Defina **timeouts** em toda chamada externa (`AbortSignal.timeout`) e **retry** só para falhas transitórias e idempotentes.
- Crie uma **hierarquia de erros** (`AppError`), preserve `cause` e diferencie erro operacional de bug.
- Em `unhandledRejection`/`uncaughtException`: **logue, encerre graciosamente e saia com código 1**.
- Use **`pipeline`** (de `node:stream/promises`) em vez de `.pipe()`.
- Processe arquivos/payloads grandes com **streams** e `for await`; respeite a **backpressure**.
- Use `Buffer.alloc` e `timingSafeEqual` para comparar segredos.
- Decodifique texto de *chunks* com **`StringDecoder`** (ou `TextDecoder` com `stream: true`) — jamais concatene `chunk.toString()` cegamente.

**❌ Nunca faça**

- **`await` dentro de `forEach`/`map` achando que espera:** `array.forEach(async (x) => await f(x))` **não
  aguarda** nada. Use `for...of` com `await` (sequencial) ou `Promise.all(array.map(...))` (paralelo).
- **`new Promise(async (resolve, reject) => ...)`** — um erro lançado no executor `async` não rejeita a Promise.
- **Antipattern do "wrapper desnecessário":** envolver em `new Promise` algo que já devolve Promise.
- **Engolir erros:** `catch (e) {}` ou `catch (e) { console.log(e) }` seguido de continuar como se nada tivesse ocorrido.
- **Perder a stack:** `catch (e) { throw new Error(e.message) }` — use `{ cause: e }`.
- **Misturar** callbacks e Promises na mesma API (escolha uma; converta com `promisify`).
- **`Promise.all` com milhares de itens** sem limite de concorrência.
- **`readFile`/`JSON.parse` em arquivos enormes**; **`+=`** em strings de *chunks* (corrompe UTF-8 multibyte).
- **Ignorar o retorno de `write()`** (`false` = pare!) e **esquecer handlers de erro** nas streams.
- **`Buffer.allocUnsafe`** sem sobrescrever o conteúdo inteiro (vaza dados de memória antiga).
- **Confiar em `res.ok` de `fetch` sem checar** — e esquecer que `fetch` não tem timeout padrão.
- **Capturar `uncaughtException` para "manter o servidor no ar"** — o estado já pode estar corrompido.

---

# Módulo 4: Construção de APIs e Ecossistema de Frameworks

## 4.1 Conceito Teórico

### Express × Fastify × NestJS

Os três resolvem o mesmo problema (receber HTTP, rotear, responder) com **filosofias diferentes**.

| Critério | **Express 5** | **Fastify 5** | **NestJS** (11/12) |
|----------|---------------|---------------|---------------------|
| **Filosofia** | Minimalista: roteamento + *middlewares*; o resto é com você | Alta performance, **plugins encapsulados**, *schema-first* | Framework **opinativo** e modular, inspirado no Angular (módulos, DI, decorators) |
| **Estrutura imposta** | Nenhuma | Pouca (plugins/rotas) | Forte (Module → Controller → Provider) |
| **Validação** | Manual (Zod/Joi em middleware) | **Nativa** por JSON Schema (Ajv) ou *type providers* (Zod, TypeBox) | *Pipes* (`class-validator`, Zod); NestJS 12 tem suporte nativo a *Standard Schema* |
| **Serialização** | `JSON.stringify` | Serialização compilada por schema (`fast-json-stringify`) — mais rápida | Depende do adaptador |
| **Logging** | Você escolhe (pino, winston) | **pino integrado** | Logger próprio (plugável a pino) |
| **Injeção de dependência** | Manual | `decorate`/plugins | **Container IoC** completo |
| **TypeScript** | Via `@types/*` | Suporte de primeira classe | **TS-first** (decorators + metadados) |
| **Performance relativa** | Boa | **Mais alta** (benchmarks sintéticos costumam mostrar ~2x o Express) | Menor que o framework-base (camada extra), mas suficiente |
| **Curva de aprendizado** | Baixa | Média | Alta (conceitos de arquitetura) |
| **Ecossistema** | Imenso | Grande e crescente | Grande, integrações oficiais (Prisma, TypeORM, GraphQL, filas, microserviços) |
| **Melhor para** | Protótipos, APIs pequenas, aprendizado, equipes que querem controle total | Microserviços, APIs de alto tráfego, equipes que valorizam performance e schemas | Aplicações grandes, equipes grandes, domínios complexos, padronização |

> **Sobre os benchmarks:** eles medem uma rota trivial devolvendo JSON. Em aplicações reais, o gargalo costuma
> estar no **banco de dados e em chamadas externas**, não no roteador. Escolha pelo **modelo de projeto e de equipe**;
> otimize performance depois de medir.

> O NestJS roda **sobre** Express (padrão) ou Fastify (`@nestjs/platform-fastify`): ele não é um concorrente
> do roteador, é uma **camada de arquitetura** por cima dele.

**O que mudou no Express 5** (principais pontos, confira o guia oficial de migração):

- **Handlers `async` que lançam erro / rejeitam** são encaminhados ao *error handler* **automaticamente** (no
  Express 4 era preciso `try/catch` + `next(err)` ou um wrapper `asyncHandler`).
- Sintaxe de caminhos mudou (`path-to-regexp` v8): curingas precisam de nome (`/arquivos/*splat`), parâmetros
  opcionais usam `{/:id}`.
- `req.query` passa a ser um *getter* (somente leitura): **não é possível reatribuí-lo** em middlewares de validação.
- `req.body` é `undefined` (e não `{}`) quando nenhum *body parser* leu o corpo.

### Estruturando o projeto: MVC → camadas → Clean Architecture / DDD

**MVC** (Model-View-Controller) em APIs vira, na prática, **Rota → Controller → Model**. Funciona para CRUDs
simples, mas tende a gerar *fat controllers* e modelos acoplados ao ORM.

**Arquitetura em camadas** separa responsabilidades:

```text
 HTTP ─▶  Controller / Rota   (traduz HTTP ⇄ chamadas; valida entrada; NÃO tem regra de negócio)
              │
              ▼
          Service / Use Case  (orquestra a regra de negócio; controla transações)
              │
              ▼
          Repository          (acesso a dados; esconde SQL/ORM)
              │
              ▼
           Banco / APIs externas
```

**Clean Architecture / Hexagonal (Ports & Adapters)** inverte as dependências: o **domínio** (regras de negócio)
não conhece framework, banco nem HTTP. Tudo aponta **para dentro** (*Dependency Rule*):

```text
┌──────────────────────────────────────────────────────────────┐
│ Infraestrutura / Frameworks: Express, Prisma, Redis, SMTP    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Adaptadores de interface: Controllers, Repositórios    │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Aplicação: Casos de Uso (+ Portas = interfaces)  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │ DOMÍNIO: Entidades, Value Objects, Regras  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
        as setas de dependência apontam sempre para o centro
```

**Blocos de construção do DDD** (*Domain-Driven Design*):

| Conceito | O que é | Exemplo (biblioteca) |
|----------|---------|----------------------|
| **Entidade** | Objeto com **identidade** que muda ao longo do tempo | `Emprestimo`, `Livro` |
| **Value Object** | Definido pelos **valores**, imutável, **se auto-valida** | `Isbn`, `Email`, `Dinheiro` |
| **Agregado** | Cluster de objetos com uma **raiz** que garante invariantes | `Emprestimo` (raiz) com suas renovações |
| **Repositório** | Abstração de coleção/persistência (interface no domínio, implementação na infra) | `EmprestimoRepository` |
| **Serviço de Domínio** | Regra que não pertence a uma entidade só | `CalculadoraDeMulta` |
| **Caso de Uso** (Application Service) | Um cenário do sistema, orquestrando entidades e repositórios | `EmprestarLivro` |
| **Evento de Domínio** | Fato ocorrido que interessa a outras partes | `LivroEmprestado` |

**Organizar por camada × por funcionalidade (*feature/module*):**

```text
# por camada (tende a espalhar uma funcionalidade por várias pastas)
src/controllers  src/services  src/repositories  src/models

# por funcionalidade (recomendado): cada módulo é coeso e tem suas camadas internas
src/modules/emprestimos/
  domain/            entidades, value objects, interfaces (portas)
  application/       casos de uso
  infra/             repositório Prisma, adaptadores externos
  http/              controller, rotas, schemas de validação
```

> **Pragmatismo:** Clean Architecture/DDD **têm custo** (mais arquivos, mais indireção). Use quando o domínio tem
> regras ricas e vida longa. Para um CRUD, **camadas simples** (rota → serviço → repositório) bastam. Evolua a
> arquitetura quando a dor aparecer, não antes.

### Validação de dados (Zod / Joi)

Princípio: **nunca confie na entrada**. Valide **nas fronteiras** do sistema: corpo, parâmetros, *query*, *headers*,
variáveis de ambiente e respostas de APIs externas.

| | **Zod** | **Joi** |
|---|---------|---------|
| Inferência de tipos TS | ✔ (`z.infer<typeof schema>`): **uma fonte de verdade** | ❌ (precisa duplicar o tipo) |
| Estilo | "Parse, don't validate": devolve dado **já tipado** | Valida e devolve valor convertido |
| Ecossistema | Enorme em TS (tRPC, type providers, forms) | Maduro, muito usado em projetos JS/Hapi |
| Observação | Zod 4: `z.prettifyError`, `z.flattenError`, formatos de topo (`z.email()`, `z.url()`) | Joi 18+ implementa *Standard Schema* |

Alternativas leves: **Valibot**, **ArkType**. O padrão **Standard Schema** permite que frameworks aceitem qualquer
uma dessas bibliotecas sem acoplamento.

Regras de ouro: **allow-list** (aceitar só o que se espera), **limitar tamanhos** (strings, arrays, payload),
**coagir** tipos em *query strings* (`z.coerce.number()`), **remover chaves desconhecidas** (o comportamento
padrão do Zod) ou rejeitá-las (`.strict()`), e **nunca** repassar `req.body` direto ao ORM (*mass assignment*).

### Tratamento global de erros

Um único ponto converte **qualquer** erro em uma resposta HTTP padronizada:

| Origem | Resposta |
|--------|----------|
| Erro de validação (Zod) | `400` com detalhes por campo |
| `AppError` (operacional) | O `status` e a mensagem definidos no erro |
| Erro do *body parser* (JSON malformado, payload grande) | `400` / `413` |
| Erro desconhecido (bug) | `500` **genérico** (detalhes só no log) + `traceId` |

Use o formato **Problem Details** (RFC 9457, `application/problem+json`): `type`, `title`, `status`, `detail`, e
campos extras. É um padrão aberto que clientes e *gateways* entendem.

## 4.2 Exemplos de Código Prático

### O mesmo endpoint nos três frameworks

Endpoint: `POST /livros` com validação.

**Esquema compartilhado (Zod):**

```ts
// src/modules/livros/livros.schemas.ts
import { z } from "zod";

export const criarLivroSchema = z.object({
  titulo: z.string().trim().min(1).max(200),
  isbn: z.string().regex(/^\d{13}$/, "ISBN deve ter 13 dígitos"),
  anoPublicacao: z.number().int().min(1450).max(new Date().getFullYear()),
  categoriaId: z.string().min(1),
});

export type CriarLivroDTO = z.infer<typeof criarLivroSchema>;
```

**Express 5:**

```ts
// src/app.ts
import express from "express";
import { criarLivroSchema } from "./modules/livros/livros.schemas.js";
import { NaoEncontradoError } from "./erros/app-error.js";

export const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/livros", async (req, res) => {
  const dados = criarLivroSchema.parse(req.body);        // lança ZodError → vai ao error handler
  const livro = await livrosService.criar(dados);        // erro/rejeição também vai ao error handler (Express 5)
  res.status(201).location(`/livros/${livro.id}`).json(livro);
});

app.get("/livros/:id", async (req, res) => {
  const livro = await livrosService.buscar(req.params.id);
  if (!livro) throw new NaoEncontradoError("Livro", req.params.id);   // sem try/catch nem next()
  res.json(livro);
});
```

**Fastify 5 (Zod como validador e serializador):**

```ts
// src/app.ts
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { criarLivroSchema } from "./modules/livros/livros.schemas.js";

export const app = Fastify({ logger: true });   // pino já integrado

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().post(
  "/livros",
  {
    schema: {
      body: criarLivroSchema,                                    // validado ANTES do handler
      response: { 201: z.object({ id: z.string(), titulo: z.string() }) },   // serializa só o declarado
    },
  },
  async (request, reply) => {
    const livro = await livrosService.criar(request.body);        // request.body já tipado como CriarLivroDTO
    return reply.code(201).send(livro);
  },
);
```

> Verifique a versão de `fastify-type-provider-zod` compatível com a do seu `zod` e do `fastify`.

**NestJS (Controller + Service + Module):**

```ts
// src/modules/livros/zod-validation.pipe.ts
import { BadRequestException, PipeTransform } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(valor: unknown) {
    const resultado = this.schema.safeParse(valor);
    if (!resultado.success) {
      throw new BadRequestException({ mensagem: "Dados inválidos", erros: z.flattenError(resultado.error) });
    }
    return resultado.data;
  }
}
```

```ts
// src/modules/livros/livros.controller.ts
import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { LivrosService } from "./livros.service.js";
import { criarLivroSchema, type CriarLivroDTO } from "./livros.schemas.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

@Controller("livros")
export class LivrosController {
  constructor(private readonly livros: LivrosService) {}      // injeção de dependência por construtor

  @Post()
  @HttpCode(201)
  criar(@Body(new ZodValidationPipe(criarLivroSchema)) dados: CriarLivroDTO) {
    return this.livros.criar(dados);
  }

  @Get(":id")
  buscar(@Param("id") id: string) {
    return this.livros.buscar(id);
  }
}
```

```ts
// src/modules/livros/livros.module.ts
import { Module } from "@nestjs/common";
import { LivrosController } from "./livros.controller.js";
import { LivrosService } from "./livros.service.js";

@Module({
  controllers: [LivrosController],
  providers: [LivrosService],     // o container instancia e injeta
  exports: [LivrosService],       // disponível para outros módulos
})
export class LivrosModule {}
```

> Nas versões atuais do NestJS há suporte nativo a *Standard Schema*, o que dispensa o *pipe* manual acima.
> Consulte a documentação da sua versão.

### Estrutura Clean Architecture de um módulo (TypeScript)

```text
src/
├── main/                       # composition root: liga tudo (DI manual)
│   ├── server.ts
│   └── composicao.ts
├── shared/
│   ├── erros/app-error.ts
│   └── http/tratador-de-erros.ts
└── modules/
    └── emprestimos/
        ├── domain/
        │   ├── emprestimo.ts                 # entidade
        │   ├── isbn.ts                       # value object
        │   └── repositorios.ts               # PORTAS (interfaces)
        ├── application/
        │   └── emprestar-livro.usecase.ts
        ├── infra/
        │   ├── emprestimo.repository.prisma.ts
        │   └── emprestimo.repository.memoria.ts   # usado nos testes
        └── http/
            ├── emprestimos.controller.ts
            └── emprestimos.schemas.ts
```

**Value Object que se auto-valida:**

```ts
// domain/isbn.ts
import { AppError } from "../../../shared/erros/app-error.js";

export class Isbn {
  private constructor(readonly valor: string) {}

  static criar(entrada: string): Isbn {
    const limpo = entrada.replace(/[-\s]/g, "");
    if (!/^\d{13}$/.test(limpo) || !Isbn.digitoVerificadorOk(limpo)) {
      throw new AppError("ISBN inválido", { status: 422, codigo: "ISBN_INVALIDO" });
    }
    return new Isbn(limpo);
  }

  // ISBN-13: pesos 1 e 3 alternados nos 12 primeiros dígitos
  private static digitoVerificadorOk(isbn: string): boolean {
    const soma = [...isbn.slice(0, 12)].reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
    return (10 - (soma % 10)) % 10 === Number(isbn[12]);
  }

  igual(outro: Isbn): boolean {
    return this.valor === outro.valor;
  }
}
```

**Entidade com regras de negócio (invariantes protegidas):**

```ts
// domain/emprestimo.ts
import { randomUUID } from "node:crypto";
import { ConflitoError } from "../../../shared/erros/app-error.js";

export class Emprestimo {
  private constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly livroId: string,
    readonly emprestadoEm: Date,
    private _devolvidoEm: Date | null,
  ) {}

  static novo(usuarioId: string, livroId: string, agora = new Date()): Emprestimo {
    return new Emprestimo(randomUUID(), usuarioId, livroId, agora, null);
  }

  static reconstituir(p: { id: string; usuarioId: string; livroId: string; emprestadoEm: Date; devolvidoEm: Date | null }) {
    return new Emprestimo(p.id, p.usuarioId, p.livroId, p.emprestadoEm, p.devolvidoEm);
  }

  get devolvidoEm() { return this._devolvidoEm; }
  get devolvido() { return this._devolvidoEm !== null; }

  devolver(agora = new Date()): void {
    if (this.devolvido) throw new ConflitoError("Empréstimo já devolvido");   // regra no domínio, não no controller
    this._devolvidoEm = agora;
  }
}
```

**Portas (interfaces) e caso de uso:**

```ts
// domain/repositorios.ts — o DOMÍNIO define o que precisa; a infra implementa
import type { Emprestimo } from "./emprestimo.js";

export interface EmprestimoRepository {
  salvar(emprestimo: Emprestimo): Promise<void>;
  buscarPorId(id: string): Promise<Emprestimo | null>;
}

export interface LivroGateway {
  /** Marca como indisponível de forma atômica. Retorna false se já estava indisponível. */
  reservar(livroId: string): Promise<boolean>;
  liberar(livroId: string): Promise<void>;
}
```

```ts
// application/emprestar-livro.usecase.ts
import { Emprestimo } from "../domain/emprestimo.js";
import type { EmprestimoRepository, LivroGateway } from "../domain/repositorios.js";
import { ConflitoError } from "../../../shared/erros/app-error.js";

export class EmprestarLivro {
  constructor(
    private readonly emprestimos: EmprestimoRepository,   // dependências por INTERFACE (inversão de dependência)
    private readonly livros: LivroGateway,
  ) {}

  async executar(entrada: { usuarioId: string; livroId: string }): Promise<{ id: string }> {
    const reservado = await this.livros.reservar(entrada.livroId);
    if (!reservado) throw new ConflitoError("Livro indisponível no momento");

    const emprestimo = Emprestimo.novo(entrada.usuarioId, entrada.livroId);
    try {
      await this.emprestimos.salvar(emprestimo);
    } catch (erro) {
      await this.livros.liberar(entrada.livroId);          // compensação se a persistência falhar
      throw erro;
    }
    return { id: emprestimo.id };
  }
}
```

**Composition root (injeção de dependência manual) e controller:**

```ts
// main/composicao.ts
import { EmprestarLivro } from "../modules/emprestimos/application/emprestar-livro.usecase.js";
import { EmprestimoRepositoryPrisma } from "../modules/emprestimos/infra/emprestimo.repository.prisma.js";
import { LivroGatewayPrisma } from "../modules/emprestimos/infra/livro.gateway.prisma.js";
import { criarEmprestimosRouter } from "../modules/emprestimos/http/emprestimos.controller.js";
import { prisma } from "../shared/prisma.js";

export function compor() {
  // ÚNICO lugar que conhece as implementações concretas
  const emprestimosRepo = new EmprestimoRepositoryPrisma(prisma);
  const livrosGateway = new LivroGatewayPrisma(prisma);
  const emprestarLivro = new EmprestarLivro(emprestimosRepo, livrosGateway);

  return { emprestimosRouter: criarEmprestimosRouter({ emprestarLivro }) };
}
```

```ts
// http/emprestimos.controller.ts
import { Router } from "express";
import { z } from "zod";
import type { EmprestarLivro } from "../application/emprestar-livro.usecase.js";

const bodySchema = z.object({ livroId: z.string().min(1) });

export function criarEmprestimosRouter(deps: { emprestarLivro: EmprestarLivro }) {
  const router = Router();

  router.post("/", async (req, res) => {
    const { livroId } = bodySchema.parse(req.body);
    const usuarioId = res.locals.usuarioId as string;      // vem do middleware de autenticação (Módulo 6)
    const resultado = await deps.emprestarLivro.executar({ usuarioId, livroId });
    res.status(201).json(resultado);
  });

  return router;
}
```

O ganho: o caso de uso é testável **sem banco e sem HTTP** (basta passar repositórios em memória — Módulo 7).

### Middleware de validação reutilizável (Express 5)

```ts
// src/shared/http/validar.ts
import type { RequestHandler } from "express";
import type { z } from "zod";

interface Esquemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

/**
 * No Express 5, `req.query` é somente leitura. Por isso o resultado validado vai para `res.locals.validado`.
 */
export const validar = (esquemas: Esquemas): RequestHandler => (req, res, next) => {
  res.locals.validado = {
    body: esquemas.body?.parse(req.body),
    query: esquemas.query?.parse(req.query),
    params: esquemas.params?.parse(req.params),
  };
  next();                           // se parse lançar ZodError, o Express 5 já encaminha ao error handler
};

// uso:
// router.get("/", validar({ query: z.object({ pagina: z.coerce.number().int().min(1).default(1) }) }), handler);
```

### Tratador global de erros (Express 5, Problem Details)

```ts
// src/shared/http/tratador-de-erros.ts
import type { ErrorRequestHandler, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { z, ZodError } from "zod";
import { AppError } from "../erros/app-error.js";

/** 404 para rotas inexistentes — registre DEPOIS de todas as rotas */
export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  res.status(404).type("application/problem+json").json({
    type: "about:blank",
    title: "Rota não encontrada",
    status: 404,
    detail: `${req.method} ${req.path}`,
  });
};

/** Error handler — registre por ÚLTIMO (4 parâmetros = o Express o reconhece como tratador de erros) */
export const tratadorDeErros: ErrorRequestHandler = (erro, req, res, next) => {
  if (res.headersSent) return next(erro);                 // resposta já começou: delega ao handler padrão

  const problema = (status: number, title: string, extra: Record<string, unknown> = {}) =>
    res.status(status).type("application/problem+json").json({ type: "about:blank", title, status, ...extra });

  // 1) validação
  if (erro instanceof ZodError) {
    return problema(400, "Dados inválidos", { errors: z.flattenError(erro).fieldErrors });
  }

  // 2) erros de domínio / aplicação
  if (erro instanceof AppError && erro.operacional) {
    return problema(erro.status, erro.message, { code: erro.codigo });
  }

  // 3) erros do body-parser (JSON malformado = 400, payload grande = 413): trazem status e `expose`
  const e = erro as { status?: number; expose?: boolean; message?: string };
  if (typeof e.status === "number" && e.status >= 400 && e.status < 500 && e.expose) {
    return problema(e.status, e.message ?? "Requisição inválida");
  }

  // 4) bug / erro desconhecido: loga TUDO no servidor, devolve NADA sensível
  const traceId = randomUUID();
  console.error({ traceId, metodo: req.method, url: req.originalUrl, erro });   // use pino em produção
  return problema(500, "Erro interno do servidor", { traceId });
};
```

```ts
// src/app.ts (ordem de registro importa)
app.use(express.json({ limit: "100kb" }));
app.use("/emprestimos", emprestimosRouter);
app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);
```

**Equivalentes:** no Fastify use `app.setErrorHandler((erro, req, reply) => {...})` e `app.setNotFoundHandler(...)`;
no NestJS, um `ExceptionFilter`:

```ts
// NestJS — filtro global
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class TodasAsExcecoesFilter implements ExceptionFilter {
  catch(excecao: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = excecao instanceof HttpException ? excecao.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (status >= 500) console.error(excecao);                          // detalhes só no log
    res.status(status).json({
      status,
      title: status >= 500 ? "Erro interno do servidor" : (excecao as HttpException).message,
    });
  }
}
// main.ts:  app.useGlobalFilters(new TodasAsExcecoesFilter());
```

### `server.ts` com *timeouts* e encerramento gracioso

```ts
// src/main/server.ts
import { app } from "../app.js";
import { env } from "../config/env.js";
import { registrarEncerramento } from "../processo.js";   // do Módulo 3

const servidor = app.listen(env.PORT, () => console.log(`API em http://localhost:${env.PORT}`));

// Proteção contra conexões lentas/penduradas (Slowloris) — valores a ajustar conforme o seu proxy
servidor.headersTimeout = 15_000;
servidor.requestTimeout = 30_000;
servidor.keepAliveTimeout = 65_000;     // maior que o idle timeout do load balancer (ex.: ALB = 60 s)

registrarEncerramento(servidor, async () => {
  // await prisma.$disconnect(); await redis.quit(); ...
});
```

## 4.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Valide toda entrada** nas fronteiras com Zod/Joi e use o **tipo inferido** como contrato único.
- Mantenha controllers **finos**: traduzem HTTP, chamam um serviço/caso de uso, devolvem resposta.
- Coloque **regras de negócio** em serviços/entidades — testáveis sem HTTP e sem banco.
- Defina **um tratador global de erros** com formato padronizado (Problem Details) e `traceId`.
- **Versione** a API (`/v1/...`) e use os verbos/status corretos (`201` + `Location`, `204`, `404`, `409`, `422`).
- Aplique **paginação**, **limites de payload** (`express.json({ limit })`) e **timeouts** do servidor.
- Organize por **funcionalidade (módulos)**; injete dependências por **interface** e monte tudo em um único *composition root*.
- Gere **documentação** da API a partir do código/esquemas (OpenAPI/Swagger).

**❌ Nunca faça**

- **Regra de negócio no controller** ou SQL dentro de rotas.
- Passar **`req.body` direto** para `prisma.create`/`update` (*mass assignment*: o cliente pode setar `role: "admin"`).
- Devolver **entidades do banco "cruas"** (com `password`, campos internos) — use DTOs de resposta.
- Vazar `error.message`, *stack trace* ou detalhes de SQL ao cliente em produção.
- Usar **singletons globais e imports concretos** por todo lado (inviabiliza testes): injete dependências.
- **Over-engineering:** aplicar DDD completo em um CRUD de 4 tabelas. Complexidade tem custo.
- Misturar estilos: metade das rotas com `try/catch`+`next`, metade com `throw`, sem padrão.
- Reatribuir `req.query` no Express 5 (é somente leitura) — guarde o valor validado em `res.locals`.
- Escolher o framework por **benchmark sintético**: avalie equipe, domínio, ecossistema e manutenção.
- Esquecer `res.headersSent` no error handler (causa "Cannot set headers after they are sent").

---

# Módulo 5: Banco de Dados, ORMs e Persistência

## 5.1 Conceito Teórico

### Relacional × não relacional

| | **Relacional (PostgreSQL, MySQL)** | **Documentos (MongoDB)** |
|---|------------------------------------|---------------------------|
| Modelo | Tabelas, linhas, **esquema rígido**, chaves estrangeiras | Coleções de documentos JSON/BSON, esquema flexível |
| Consistência | **ACID** completo, transações multi-tabela, `JOIN`s | Transações multi-documento existem, mas o modelo favorece **agregados embutidos** |
| Brilha em | Dados estruturados e relacionados, relatórios, integridade forte | Dados hierárquicos/variáveis, catálogos, logs, prototipação rápida |
| Cuidado | Migrações de esquema exigem planejamento | Falta de esquema **no banco** empurra a disciplina para a aplicação |

> **Padrão sensato:** comece com **PostgreSQL**. Ele cobre a maioria dos casos (inclusive JSON com `jsonb`).
> Adote outro banco quando houver uma necessidade concreta e medida.

**Drivers** (camada mais baixa, falam o protocolo do banco): `pg` (node-postgres) e `postgres` para PostgreSQL;
`mysql2` para MySQL/MariaDB; `mongodb` (driver oficial) para MongoDB.

### ORMs e Query Builders: o panorama

| Categoria | O que faz | Exemplos |
|-----------|-----------|----------|
| **Driver puro** | Você escreve SQL e recebe linhas | `pg`, `mysql2` |
| **Query Builder** | Constrói SQL por código encadeado, mais próximo do SQL | Knex, Kysely, Drizzle (também tem camada ORM) |
| **ORM** (relacional) | Mapeia tabelas para objetos, relações, migrations | **Prisma**, **TypeORM**, Sequelize, MikroORM |
| **ODM** (documentos) | Mapeia coleções para modelos | **Mongoose** |

#### Prisma × TypeORM × Mongoose

| | **Prisma** | **TypeORM** | **Mongoose** |
|---|------------|-------------|--------------|
| **Banco** | PostgreSQL, MySQL, SQLite, SQL Server, CockroachDB... | PostgreSQL, MySQL, SQLite, SQL Server, Oracle... | **MongoDB** |
| **Definição do modelo** | `schema.prisma` (arquivo próprio) → Client **gerado** | **Classes com decorators** (`@Entity`, `@Column`) | `Schema` em JS/TS |
| **Tipagem TS** | **Excelente** (tipos gerados do schema, retorno depende do `select`/`include`) | Boa, porém retorno de relações/queries é menos preciso | Aceitável (`InferSchemaType`); populate perde tipos |
| **Migrations** | **Prisma Migrate** integrado | CLI de migrations (geração por *diff* + SQL manual) | Sem migrations nativas (esquema flexível; scripts à parte) |
| **Estilo** | API declarativa (`findMany({ where, include })`) | **Active Record** *ou* **Data Mapper**; QueryBuilder | API de modelo + *middleware* (hooks) |
| **Pontos fortes** | Produtividade, segurança de tipos, DX, migrations | Maturidade, flexibilidade, encaixa bem no NestJS, padrão Data Mapper | Validação e hooks no modelo, `populate`, comunidade enorme |
| **Pontos fracos** | Abstração limita SQL muito complexo (use SQL cru); passo de `generate`; Prisma 7 exige *driver adapter* | Manutenção/ritmo de releases historicamente irregular, armadilhas de *lazy loading*/N+1, tipagem mais frouxa | Tipagem fraca com `populate`, custo de hidratação de documentos (use `lean()`), `populate` pode virar N+1 |
| **Use quando** | Projeto TypeScript com banco relacional e foco em produtividade/segurança de tipos | Projeto NestJS/legado com TypeORM, ou preferência por Data Mapper com decorators | A fonte de dados **é** MongoDB |

**Regra de decisão resumida:**

```text
Banco é MongoDB?                              → Mongoose (ou driver oficial para casos simples)
Relacional + TypeScript + produtividade?      → Prisma
Relacional + já usa NestJS/TypeORM ou quer Data Mapper com decorators? → TypeORM
Quer controle quase total do SQL com tipos?   → Kysely / Drizzle
Consulta extremamente específica/performática → SQL cru (qualquer ferramenta permite)
```

> ORM não dispensa conhecer SQL. Você precisa **ler o SQL gerado**, entender índices e planos de execução
> (`EXPLAIN ANALYZE`) e saber quando abandonar a abstração.

### Gerenciamento de conexões e *pool*

Abrir uma conexão com o banco é **caro**: handshake TCP, TLS, autenticação, alocação de recursos no servidor
(no PostgreSQL, **um processo por conexão**, na casa de alguns MB cada). Um **pool** mantém um conjunto de
conexões abertas e as **empresta** às requisições.

```text
 Requisição 1 ─┐                      ┌── conexão 1 ──┐
 Requisição 2 ─┼──▶ [  POOL (max=10) ]├── conexão 2 ──┼──▶ PostgreSQL
 Requisição 3 ─┤   fila de espera      └── ...        ┘     (max_connections = 100)
 Requisição 11 ┘   quando todas ocupadas
```

| Parâmetro (node-postgres) | Significado | Orientação |
|---------------------------|-------------|------------|
| `max` | Máximo de conexões do pool **por processo** | 10–20 costuma bastar; mais não significa mais rápido |
| `idleTimeoutMillis` | Fecha conexões ociosas após N ms | ~30 000 |
| `connectionTimeoutMillis` | Tempo máximo esperando uma conexão livre | ~5 000 (**sem isso, requisições ficam penduradas para sempre**) |
| `statement_timeout` | Cancela queries lentas no servidor | Proteção contra queries descontroladas |
| `allowExitOnIdle` | Permite o processo terminar com o pool ocioso | Útil em scripts |

**Dimensionamento:** `instâncias da API × max do pool ≤ max_connections do banco` (descontando conexões
reservadas para migrations, BI, admin). Com muitas réplicas ou *serverless*, use um **pooler externo**
(PgBouncer, RDS Proxy, o *pooler* do Neon).

**Regras de ouro do pool:**

1. **Um pool por processo**, criado na inicialização (singleton) — nunca um pool por requisição.
2. `pool.query(...)` empresta e devolve sozinho. Para **transações**, use `pool.connect()` → **mesma conexão**
   para `BEGIN`…`COMMIT` → **`release()` sempre em `finally`**.
3. Trate o evento `'error'` do pool (conexões ociosas podem cair; sem *listener*, o processo cai).
4. Monitore `totalCount`, `idleCount` e `waitingCount`: `waitingCount` alto = pool esgotado (vazamento de conexão
   ou `max` pequeno demais / queries lentas).
5. No *shutdown*, feche o pool (`await pool.end()`).

### Memory Leaks em Node.js

Um **vazamento de memória** é memória que o programa **não precisa mais, mas continua referenciada**, então o
GC não pode liberá-la. Sintoma: `heapUsed` **sobe continuamente** mesmo após GCs, até o processo ser morto
(*OOM*) ou ficar lento por causa de GC frequente.

| Causa comum | Como acontece | Correção |
|-------------|---------------|----------|
| **Cache sem limite** | `const cache = new Map()` que só cresce | **LRU com TTL** (`lru-cache`) |
| **Listeners acumulados** | `emitter.on(...)` dentro do handler de cada requisição | `once`, `off`, `AbortController`; atenção ao aviso `MaxListenersExceededWarning` |
| **Timers esquecidos** | `setInterval` nunca limpo; retém o closure inteiro | `clearInterval`; `timer.unref()` |
| **Conexões não liberadas** | `pool.connect()` sem `release()` em caso de erro | `try/finally` |
| **Closures que capturam demais** | Callback longevo referencia objetos grandes | Reduzir o escopo, anular referências |
| **Variáveis globais/módulo** | Arrays de logs/métricas acumulando | Estruturas limitadas, descarte periódico |
| **Resultados enormes em memória** | `findMany()` sem limite, `SELECT *` de milhões | Paginação, cursores, **streams** |
| **Streams não destruídas** | Cliente abandona o download e a stream fica aberta | `pipeline`, `stream.destroy()` |
| **Hidratação excessiva** | Mongoose sem `lean()` cria objetos pesados | `lean()`, `select` |

**Como investigar:**

1. **Observe a tendência:** monitore `process.memoryUsage().heapUsed` (e RSS) ao longo do tempo. Serrilhado que
   sobe a cada ciclo de GC = vazamento. Pico que volta ao normal = apenas carga.
2. **Técnica dos 3 snapshots** (Chrome DevTools → *Memory*, conectado via `node --inspect`): snapshot 1 (baseline)
   → gere carga → snapshot 2 → gere carga → snapshot 3. Na visão *Comparison*, procure objetos cujo número **só
   aumenta** entre snapshots. Siga o *Retainers* para ver **quem** os segura.
3. **Snapshot sob demanda:** `node --heapsnapshot-signal=SIGUSR2 app.js` ou `v8.writeHeapSnapshot()`.
4. Ferramentas: `clinic doctor`/`clinic heapprofiler`, `--trace-gc`, APMs com perfil de heap.

> `writeHeapSnapshot()` **bloqueia** o Event Loop e consome memória adicional (da ordem do tamanho do heap). Em
> produção, faça isso numa instância isolada do balanceador.

## 5.2 Exemplos de Código Prático

### PostgreSQL com `pg`: pool, queries parametrizadas e transações (TypeScript)

```ts
// src/db/pool.ts
import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,    // falha rápido se o pool estiver esgotado
  statement_timeout: 10_000,         // mata queries com mais de 10 s no servidor
  application_name: "api-biblioteca",// aparece em pg_stat_activity (ajuda no diagnóstico)
});

// Conexões ociosas podem ser derrubadas pelo servidor; sem este listener o processo cai
pool.on("error", (erro) => console.error("[pg] erro em conexão ociosa:", erro.message));

export async function comTransacao<T>(trabalho: (cliente: pg.PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();                 // reserva UMA conexão para toda a transação
  try {
    await cliente.query("BEGIN");
    const resultado = await trabalho(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (erro) {
    await cliente.query("ROLLBACK").catch(() => {});    // não mascara o erro original
    throw erro;
  } finally {
    cliente.release();                                  // SEMPRE devolve ao pool (senão: vazamento de conexão)
  }
}

// Métricas simples para monitorar saúde do pool
export const estatisticasPool = () => ({
  total: pool.totalCount,
  ociosas: pool.idleCount,
  aguardando: pool.waitingCount,       // > 0 por muito tempo = pool esgotado
});
```

```ts
// src/modules/livros/livros.repository.ts
import { pool, comTransacao } from "../../db/pool.js";

export interface Livro { id: string; titulo: string; isbn: string; disponivel: boolean }

export const livrosRepository = {
  // ✅ Parâmetros ($1, $2): o driver separa SQL de dados → imune a SQL injection
  async buscarPorIsbn(isbn: string): Promise<Livro | null> {
    const { rows } = await pool.query<Livro>(
      "SELECT id, titulo, isbn, disponivel FROM livros WHERE isbn = $1",
      [isbn],
    );
    return rows[0] ?? null;
  },

  // Paginação por cursor (keyset): estável e rápida mesmo com milhões de linhas
  async listar(apos: string | null, limite = 50): Promise<Livro[]> {
    const { rows } = await pool.query<Livro>(
      `SELECT id, titulo, isbn, disponivel
         FROM livros
        WHERE ($1::text IS NULL OR id > $1)
        ORDER BY id
        LIMIT $2`,
      [apos, Math.min(limite, 200)],
    );
    return rows;
  },

  async emprestar(livroId: string, usuarioId: string): Promise<string | null> {
    return comTransacao(async (c) => {
      // UPDATE condicional e atômico: só um vencedor em caso de concorrência
      const reserva = await c.query("UPDATE livros SET disponivel = false WHERE id = $1 AND disponivel = true", [livroId]);
      if (reserva.rowCount === 0) return null;

      const { rows } = await c.query<{ id: string }>(
        "INSERT INTO emprestimos (livro_id, usuario_id) VALUES ($1, $2) RETURNING id",
        [livroId, usuarioId],
      );
      return rows[0]!.id;
    });
  },
};

// ❌ NUNCA: concatenar entrada do usuário no SQL
// pool.query(`SELECT * FROM livros WHERE isbn = '${isbn}'`)   → SQL injection
```

Para **milhões de linhas**, use um cursor/stream (`pg-query-stream`) em vez de carregar tudo:

```ts
import QueryStream from "pg-query-stream";
import { pipeline } from "node:stream/promises";

const cliente = await pool.connect();
try {
  const stream = cliente.query(new QueryStream("SELECT * FROM livros WHERE ano >= $1", [2000], { batchSize: 500 }));
  await pipeline(stream, transformarParaNdjson, res);       // memória constante
} finally {
  cliente.release();
}
```

### MySQL com `mysql2/promise`

```ts
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,   // enfileira quando todas as conexões estão em uso
  connectionLimit: 10,
  queueLimit: 0,              // 0 = fila ilimitada (considere um limite para falhar rápido)
  enableKeepAlive: true,
});

// execute() usa prepared statements (parametrização real)
const [linhas] = await pool.execute("SELECT id, titulo FROM livros WHERE isbn = ?", [isbn]);

// Transação: conexão dedicada + release em finally
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  await conn.execute("UPDATE livros SET disponivel = 0 WHERE id = ? AND disponivel = 1", [livroId]);
  await conn.commit();
} catch (e) {
  await conn.rollback();
  throw e;
} finally {
  conn.release();
}
```

### MongoDB com Mongoose (TypeScript)

```ts
// src/db/mongo.ts
import mongoose from "mongoose";

mongoose.set("sanitizeFilter", true);   // trata objetos com operadores ($ne, $gt) como valores literais (anti NoSQL injection)

export async function conectarMongo(uri: string) {
  await mongoose.connect(uri, {
    maxPoolSize: 10,                    // pool de conexões do driver
    serverSelectionTimeoutMS: 5_000,    // falha rápido se o cluster estiver inacessível
  });
}

export const desconectarMongo = () => mongoose.disconnect();
```

```ts
// src/modules/livros/livro.model.ts
import { Schema, model, type InferSchemaType } from "mongoose";

const livroSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 200 },
    isbn: { type: String, required: true, unique: true },
    autores: [{ type: Schema.Types.ObjectId, ref: "Autor" }],
    disponivel: { type: Boolean, default: true },
  },
  { timestamps: true },
);

livroSchema.index({ titulo: "text" });          // índices são declarados no schema

export type Livro = InferSchemaType<typeof livroSchema>;
export const LivroModel = model("Livro", livroSchema);

// Consulta leve: select + lean() devolve objetos JS simples (sem a "hidratação" do Mongoose) + limite
const livros = await LivroModel.find({ disponivel: true })
  .select("titulo isbn")
  .sort({ titulo: 1 })
  .limit(20)
  .lean();

// ⚠️ Nunca monte regex com entrada crua (injeção de regex / ReDoS): escape antes
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const achados = await LivroModel.find({ titulo: { $regex: escapar(termo), $options: "i" } }).limit(20).lean();
```

### Prisma 7 com *driver adapter* (TypeScript)

(Detalhes de schema, migrations e relacionamentos estão no guia de Prisma; aqui, o essencial para a camada de persistência.)

```ts
// src/db/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";      // para Neon: @prisma/adapter-neon
import { env } from "../config/env.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: 10 });

// Em desenvolvimento, o hot-reload recria módulos: reaproveite a instância para não abrir pools extras
const globalComPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalComPrisma.prisma ??
  new PrismaClient({ adapter, log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"] });

if (env.NODE_ENV !== "production") globalComPrisma.prisma = prisma;
```

```ts
// Consultas tipadas, com seleção explícita de campos e transação
const livros = await prisma.livro.findMany({
  where: { disponivel: true },
  select: { id: true, titulo: true, categoria: { select: { nome: true } } },   // evita trazer colunas desnecessárias
  orderBy: { titulo: "asc" },
  take: 50,
});

const [emprestimo] = await prisma.$transaction([
  prisma.emprestimo.create({ data: { userId, livroId } }),
  prisma.livro.update({ where: { id: livroId }, data: { disponivel: false } }),
]);

// SQL cru seguro (tagged template parametriza os valores)
const ranking = await prisma.$queryRaw`SELECT "categoriaId", COUNT(*)::int AS total FROM livros GROUP BY 1 ORDER BY 2 DESC`;
```

### TypeORM com Data Mapper (TypeScript)

```ts
// src/db/entities/livro.entity.ts
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "./categoria.entity.js";

@Entity({ name: "livros" })
export class Livro {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Index({ unique: true })
  @Column({ length: 13 })
  isbn!: string;

  @Column({ default: true })
  disponivel!: boolean;

  @ManyToOne(() => Categoria, (categoria) => categoria.livros, { onDelete: "RESTRICT" })
  categoria!: Categoria;

  @CreateDateColumn()
  criadoEm!: Date;
}
```

```ts
// src/db/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Livro } from "./entities/livro.entity.js";
import { Categoria } from "./entities/categoria.entity.js";
import { env } from "../config/env.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [Livro, Categoria],
  migrations: ["dist/db/migrations/*.js"],
  synchronize: false,                 // ❌ NUNCA true em produção: pode alterar/apagar o esquema
  extra: { max: 10 },                 // repassado ao pool do driver pg
  logging: env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

// inicialização:  await AppDataSource.initialize();
```

```ts
const livroRepo = AppDataSource.getRepository(Livro);

// Evitando N+1: carregue relações no MESMO SQL (JOIN) em vez de uma query por linha
const livros = await livroRepo
  .createQueryBuilder("l")
  .leftJoinAndSelect("l.categoria", "c")
  .where("l.disponivel = :d", { d: true })
  .orderBy("l.titulo", "ASC")
  .take(50)
  .getMany();

// Transação gerenciada (commit/rollback e release automáticos)
await AppDataSource.transaction(async (manager) => {
  await manager.update(Livro, { id: livroId, disponivel: true }, { disponivel: false });
  await manager.insert(Emprestimo, { livroId, usuarioId });
});
```

### Prevenindo e diagnosticando *memory leaks*

**1. Cache limitado com TTL (em vez de `Map` infinito):**

```ts
import { LRUCache } from "lru-cache";

// ❌ const cache = new Map<string, Livro>();   // cresce para sempre
const cacheLivros = new LRUCache<string, Livro>({
  max: 500,              // no máximo 500 itens
  ttl: 60_000,           // expira em 60 s
  updateAgeOnGet: false,
});

async function buscarLivro(id: string) {
  const emCache = cacheLivros.get(id);
  if (emCache) return emCache;
  const livro = await livrosRepository.buscarPorId(id);
  if (livro) cacheLivros.set(id, livro);
  return livro;
}
```

**2. Listener que vaza × forma correta:**

```js
// ❌ A cada requisição adiciona um listener permanente → vazamento + MaxListenersExceededWarning
app.get("/eventos", (req, res) => {
  barramento.on("novo-pedido", (p) => res.write(`data: ${JSON.stringify(p)}\n\n`));
});

// ✅ Remove o listener quando o cliente desconecta
app.get("/eventos", (req, res) => {
  const aoReceber = (p) => res.write(`data: ${JSON.stringify(p)}\n\n`);
  barramento.on("novo-pedido", aoReceber);
  req.on("close", () => barramento.off("novo-pedido", aoReceber));
});
```

**3. Timers:**

```js
const intervalo = setInterval(sincronizar, 30_000);
intervalo.unref();                          // não impede o processo de encerrar
process.on("SIGTERM", () => clearInterval(intervalo));
```

**4. Monitorar a tendência do heap e tirar snapshot sob demanda:**

```ts
import { writeHeapSnapshot } from "node:v8";

// log periódico (alimente seu sistema de métricas com isso)
setInterval(() => {
  const m = process.memoryUsage();
  console.log(JSON.stringify({ evento: "memoria", heapUsedMB: Math.round(m.heapUsed / 1048576), rssMB: Math.round(m.rss / 1048576) }));
}, 30_000).unref();

// kill -USR2 <pid>  →  gera o arquivo .heapsnapshot para abrir no Chrome DevTools
process.on("SIGUSR2", () => console.log("heap snapshot em:", writeHeapSnapshot()));
```

**5. Diagnóstico com flags:**

```bash
node --inspect=0.0.0.0:9229 dist/server.js       # conecte o Chrome DevTools (chrome://inspect) e use a aba Memory
node --trace-gc dist/server.js                    # imprime cada coleta de lixo
node --max-old-space-size=1024 dist/server.js     # limita o heap (falha cedo e de forma reproduzível em testes de carga)
node --heapsnapshot-signal=SIGUSR2 dist/server.js
```

### Encerramento limpo das conexões

```ts
registrarEncerramento(servidor, async () => {
  await pool.end();                // aguarda queries em andamento e fecha as conexões do pg
  await prisma.$disconnect();      // se usar Prisma
  await mongoose.disconnect();     // se usar Mongo
});
```

## 5.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- **Um pool por processo**, dimensionado com `instâncias × max ≤ max_connections`; defina `connectionTimeoutMillis`
  e `statement_timeout`.
- **Sempre** `release()` em `finally` e trate o `'error'` do pool.
- Use **queries parametrizadas** (ou ORM) para toda entrada do usuário.
- **Pagine** tudo (preferencialmente por cursor) e use **streams/cursores** para exportações grandes.
- Selecione **apenas as colunas necessárias** (`select`), crie **índices** para colunas de filtro/junção e
  confira planos com `EXPLAIN ANALYZE`.
- Evite **N+1**: carregue relações com `include`/`JOIN`/`IN (...)`, não dentro de loops.
- Use **migrations versionadas** (Prisma Migrate, TypeORM migrations, node-pg-migrate) — nunca altere o esquema
  de produção "na mão".
- Use **transações** para operações que precisam ser atômicas e **UPDATEs condicionais** contra condições de corrida.
- Limite caches (LRU + TTL) e **monitore a memória** continuamente.
- Faça **shutdown gracioso**: pare de aceitar requisições, aguarde as em andamento, feche pools.

**❌ Nunca faça**

- **Concatenar strings em SQL** (`WHERE id = '${id}'`) ou aceitar objetos de filtro crus do cliente no MongoDB
  (`{ "$ne": null }`).
- Criar **`new Pool()`/`new PrismaClient()` por requisição** (esgota conexões do banco rapidamente).
- Esquecer `client.release()` em caminhos de erro → **vazamento de conexões** → API trava com timeouts.
- **`synchronize: true`** (TypeORM) ou `prisma db push` direto em produção.
- Executar **`SELECT *`** sem `LIMIT` em tabelas grandes; carregar coleções inteiras na memória.
- Fazer consultas **dentro de loops** (`for (id of ids) await buscar(id)`).
- Guardar **estado de requisição em variáveis globais** (vaza dados entre usuários e memória).
- Usar `Map`/array global como cache sem **limite** e **expiração**.
- Adicionar `emitter.on(...)` por requisição sem remover o listener.
- Ignorar o aviso `MaxListenersExceededWarning` aumentando o limite — ele aponta um vazamento real.
- Confiar que "o ORM resolve tudo": medir queries geradas é parte do trabalho.
- Rodar `writeHeapSnapshot()` em instância sob carga sem planejar o impacto.

---

# Módulo 6: Segurança e Boas Práticas (Production-Ready)

## 6.1 Conceito Teórico

### OWASP Top 10 (edição 2025) aplicado ao Node.js

O OWASP Top 10 é a referência mundial de riscos de segurança em aplicações web. A edição **2025** reorganizou a
lista (a *Software Supply Chain Failures* entrou como categoria própria e *Mishandling of Exceptional Conditions*
é nova). Veja como cada risco aparece em um backend Node.js:

| # | Categoria (2025) | Como aparece em Node.js | Defesa principal |
|---|------------------|--------------------------|------------------|
| **A01** | **Broken Access Control** (inclui SSRF e IDOR/BOLA) | Rota sem checar **dono**/papel; `userId` vindo do corpo; CORS aberto; *path traversal*; requisições do servidor para URLs controladas pelo usuário | **Negar por padrão**; autorização no servidor em **toda** rota; filtrar por dono; allow-list de URLs |
| **A02** | **Security Misconfiguration** | `NODE_ENV` errado, *stack traces* expostos, `X-Powered-By`, ausência de cabeçalhos de segurança, `--inspect` exposto em `0.0.0.0`, contêiner rodando como root | Helmet, configuração revisada, usuário não-root, segredos em gerenciador |
| **A03** | **Software Supply Chain Failures** | Dependência comprometida do npm, *typosquatting*, `postinstall` malicioso | Lockfile + `npm ci`, `audit`, scripts desabilitados, Renovate/Dependabot, SBOM (Módulo 2) |
| **A04** | **Cryptographic Failures** | Senha com MD5/SHA-1, `Math.random()` para tokens, segredo JWT fraco, tráfego sem TLS | **Argon2id**/bcrypt, `crypto.randomBytes`, TLS + HSTS, AES-256-GCM em repouso |
| **A05** | **Injection** (inclui **XSS**) | SQL/NoSQL injection, *command injection* (`exec`), *template injection*, XSS | Queries parametrizadas, validação por *allow-list*, `execFile`, escape de saída, CSP |
| **A06** | **Insecure Design** | Sem limite de tentativas **por projeto**, recuperação de senha fraca, regra de negócio abusável | Modelagem de ameaças, *abuse cases*, limites de negócio |
| **A07** | **Authentication Failures** | Senhas fracas, sem MFA, *brute force*, sessões que não expiram, JWT mal validado, enumeração de usuários | Argon2id, rate limiting, MFA, *refresh token rotation*, mensagens genéricas |
| **A08** | **Software or Data Integrity Failures** | Desserialização insegura, `eval`/`vm` com dados externos, *prototype pollution*, pipeline sem integridade | Validar com schema, evitar `eval`, congelar protótipos, verificar integridade/assinaturas |
| **A09** | **Security Logging & Alerting Failures** | Sem log de login/falhas de acesso, segredos nos logs, ninguém é alertado | Logs estruturados (pino) com *redact*, trilha de auditoria, alertas |
| **A10** | **Mishandling of Exceptional Conditions** | `catch` vazio, falhar "aberto", `unhandledRejection`, *stack trace* para o cliente, ausência de timeouts | Tratador global (Módulos 3 e 4), **falhar fechado**, timeouts e limites |

> A lista oficial e as orientações detalhadas ficam em [owasp.org/Top10](https://owasp.org/Top10/). Use-a como
> checklist de revisão de código e de *threat modeling*.

### Injeção (SQL, NoSQL, comandos, caminhos, SSRF)

| Tipo | Vetor | Defesa |
|------|-------|--------|
| **SQL injection** | `` `... WHERE id = '${id}'` `` | **Queries parametrizadas** / ORM (Módulo 5) |
| **NoSQL injection** | `{ "email": { "$ne": null } }` enviado como JSON | Validar tipos (`z.string()`), `sanitizeFilter` do Mongoose |
| **Command injection** | `exec("convert " + arquivo)` | `execFile(bin, [args])` (sem shell) + allow-list; evitar `shell: true` |
| **Path traversal** | `../../etc/passwd` em download/upload | `path.resolve` + conferir que o resultado começa na pasta-base |
| **SSRF** | `POST /preview { url: "http://169.254.169.254/..." }` (metadados da nuvem) | Allow-list de hosts, bloquear IPs privados/loopback/*link-local*, resolver DNS e validar |
| **Prototype pollution** | `{"__proto__": {"admin": true}}` mesclado recursivamente | Não mesclar entrada crua; validar com schema; `Object.create(null)` para mapas |
| **ReDoS** | Regex com *backtracking* exponencial | Regex simples, limite de tamanho, bibliotecas de validação testadas |
| **Template injection** | Entrada do usuário interpretada como template | Nunca compilar templates a partir de entrada externa |

### XSS e CSRF

**XSS** (*Cross-Site Scripting*) é a injeção de JavaScript executado no navegador da vítima. Em **APIs JSON**,
o risco é menor, mas existe quando: o servidor renderiza HTML (SSR/e-mails), devolve `Content-Type` incorreto,
ou um front-end insere o dado cru com `innerHTML`.

- **Escape de saída** conforme o contexto (HTML, atributo, JS, URL) — *template engines* com *auto-escape*.
- **Sanitizar HTML rico** com biblioteca dedicada (`sanitize-html`, DOMPurify) usando **allow-list** de tags.
- **CSP** (*Content-Security-Policy*) como segunda barreira.
- Cookies de sessão/refresh com **`HttpOnly`** (JavaScript não lê).

**CSRF** (*Cross-Site Request Forgery*) engana o navegador a enviar uma requisição **autenticada por cookie** para o
seu site. Só é um risco quando a autenticação é **automática** (cookies). Defesas:

1. Cookies **`SameSite=Lax`/`Strict`** (primeira linha de defesa nos navegadores modernos).
2. **Token CSRF** (*synchronizer* ou *double-submit*), ex.: pacote `csrf-csrf` (o antigo `csurf` foi descontinuado).
3. Validar **`Origin`/`Referer`** em métodos que alteram estado.
4. Exigir **cabeçalho customizado** (`X-Requested-With`) em chamadas AJAX.

> Tokens enviados manualmente em `Authorization: Bearer ...` **não** sofrem CSRF (o navegador não os anexa
> sozinho). Em compensação, se ficarem em `localStorage`, ficam expostos a **XSS** — o *trade-off* central do
> armazenamento de tokens.

### Rate limiting, *brute force* e DDoS

Defesa em **camadas** (quanto mais perto da borda, melhor):

```text
Internet ─▶ CDN / WAF (Cloudflare, AWS Shield/WAF)   ← ataques volumétricos (L3/L4/L7 em massa)
         ─▶ Load Balancer / Reverse Proxy (Nginx)    ← conexões, TLS, limites por IP
         ─▶ Aplicação Node (rate limit, timeouts)    ← abuso lógico: login, cadastro, endpoints caros
         ─▶ Banco (limites de conexão, statement_timeout)
```

| Ameaça | Mitigação na aplicação |
|--------|------------------------|
| **Brute force / credential stuffing** | Limite **estrito** em login/recuperação de senha, atraso progressivo, bloqueio temporário, CAPTCHA/MFA, mensagens genéricas |
| **Abuso de API** | Rate limit **global** + por rota/usuário/chave de API; cotas |
| **Slowloris / conexões lentas** | `headersTimeout`, `requestTimeout`, `keepAliveTimeout` (Módulo 4), proxy na frente |
| **Payloads gigantes** | `express.json({ limit })`, limite de upload, número máximo de parâmetros |
| **Endpoints caros** | Cache, paginação máxima, filas, limites de complexidade (GraphQL: *depth/cost limit*) |

> **Ataques volumétricos de DDoS não se resolvem no Node.** Eles saturam a rede antes de chegar à aplicação.
> A resposta é infraestrutura (CDN/WAF/anti-DDoS do provedor). Na aplicação, você mitiga **abuso de camada 7**.

Em ambientes com várias instâncias, o contador do rate limit precisa estar em um **armazenamento compartilhado**
(Redis); senão cada instância conta separado. E atrás de proxy, configure `trust proxy` corretamente — senão
**todos** os usuários parecem ter o IP do proxy (e entram juntos no mesmo limite).

## 6.2 Exemplos de Código Prático (Parte 1: perímetro, injeção e validação)

### Aplicação "endurecida": Helmet, CORS, limites e *rate limiting*

```ts
// src/seguranca.ts
import type { Express } from "express";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";

export function aplicarSeguranca(app: Express) {
  app.disable("x-powered-by");                 // não anuncie a tecnologia (Helmet também remove)
  app.set("trust proxy", 1);                    // atrás de 1 proxy/LB: o IP real vem de X-Forwarded-For

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "frame-ancestors": ["'none'"],       // anti-clickjacking
          "object-src": ["'none'"],
        },
      },
      hsts: { maxAge: 31_536_000, includeSubDomains: true },   // força HTTPS por 1 ano
      referrerPolicy: { policy: "no-referrer" },
    }),
  );

  // CORS com ALLOW-LIST explícita. Com `credentials: true`, NUNCA use "*"
  app.use(
    cors({
      origin: env.CORS_ORIGINS,                           // ex.: ["https://app.minhaempresa.com"]
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
    }),
  );

  app.use(express.json({ limit: "100kb" }));                 // limite de corpo
  app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 50 }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,                                            // 300 req / 15 min por IP
      standardHeaders: true,                                 // envia RateLimit-* para o cliente
      legacyHeaders: false,
    }),
  );
}
```

```ts
// src/seguranca/limitadores.ts — limitadores específicos (multi-instância: use um store Redis)
import { rateLimit } from "express-rate-limit";
// import { RedisStore } from "rate-limit-redis";
// import { redis } from "../infra/redis.js";

export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,                          // 5 tentativas por IP a cada 15 min
  skipSuccessfulRequests: true,      // login bem-sucedido não consome o limite
  standardHeaders: true,
  legacyHeaders: false,
  message: { type: "about:blank", title: "Muitas tentativas. Tente novamente mais tarde.", status: 429 },
  // store: new RedisStore({ sendCommand: (...args: string[]) => redis.sendCommand(args) }),
});
```

### Defesas contra injeção e abuso de caminhos

```ts
// src/seguranca/injecao.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { lookup } from "node:dns/promises";
import { BlockList } from "node:net";
import { AppError } from "../erros/app-error.js";

const execFileAsync = promisify(execFile);

// ❌ exec(`convert ${arquivo} saida.png`)  → "a.png; rm -rf /" executa o segundo comando
// ✅ execFile NÃO usa shell: cada argumento é um argumento, ponto final
export async function converterImagem(entrada: string, saida: string) {
  await execFileAsync("convert", [entrada, saida], { timeout: 10_000 });
}

// Path traversal: o resultado final tem que continuar DENTRO da pasta-base
const BASE = path.resolve("uploads");

export function caminhoSeguro(nomeInformado: string): string {
  const alvo = path.resolve(BASE, nomeInformado);                 // normaliza "../"
  if (!alvo.startsWith(BASE + path.sep)) {
    throw new AppError("Caminho inválido", { status: 400, codigo: "CAMINHO_INVALIDO" });
  }
  return alvo;
}

// SSRF: allow-list de hosts + bloqueio de faixas internas
const bloqueados = new BlockList();
bloqueados.addSubnet("10.0.0.0", 8);
bloqueados.addSubnet("172.16.0.0", 12);
bloqueados.addSubnet("192.168.0.0", 16);
bloqueados.addSubnet("127.0.0.0", 8);
bloqueados.addSubnet("169.254.0.0", 16);      // link-local: inclui o endpoint de metadados da nuvem
bloqueados.addAddress("::1", "ipv6");
bloqueados.addSubnet("fc00::", 7, "ipv6");
bloqueados.addSubnet("fe80::", 10, "ipv6");

export async function validarUrlExterna(entrada: string, hostsPermitidos: readonly string[]): Promise<URL> {
  const url = new URL(entrada);                                   // lança se for inválida
  if (url.protocol !== "https:") throw new AppError("Somente HTTPS", { status: 400 });
  if (!hostsPermitidos.includes(url.hostname)) throw new AppError("Host não permitido", { status: 400 });

  const { address, family } = await lookup(url.hostname);         // resolve o DNS ANTES de conectar
  if (bloqueados.check(address, family === 6 ? "ipv6" : "ipv4")) {
    throw new AppError("Destino não permitido", { status: 400 });
  }
  return url;
  // Atenção: DNS rebinding — em cenários críticos, conecte diretamente ao IP validado (agente HTTP com lookup fixo).
}
```

```ts
// Prototype pollution: não mescle entrada crua; valide com schema (Zod descarta chaves desconhecidas)
const preferencias = z.object({ tema: z.enum(["claro", "escuro"]), idioma: z.string().max(10) }).parse(req.body);

// Mapa dinâmico seguro (sem protótipo herdado)
const contagem = Object.create(null) as Record<string, number>;

// XSS: se precisar aceitar HTML do usuário, sanitize com allow-list
import sanitizeHtml from "sanitize-html";
const limpo = sanitizeHtml(sujo, {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["https", "mailto"],
});
```

### Proteção CSRF básica para API com cookies (Origin check + SameSite)

```ts
// src/seguranca/csrf.ts
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { ProibidoError } from "../erros/app-error.js";

const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Para rotas autenticadas por COOKIE: exige que Origin (ou Referer) seja de uma origem confiável */
export const verificarOrigem: RequestHandler = (req, _res, next) => {
  if (METODOS_SEGUROS.has(req.method)) return next();

  const referer = req.get("referer");
  const origem = req.get("origin") ?? (referer ? new URL(referer).origin : undefined);

  if (!origem || !env.CORS_ORIGINS.includes(origem)) throw new ProibidoError("Origem não permitida");
  next();
};
```

### Logs seguros com `pino` e `redact`

```ts
// src/infra/logger.ts
import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.senha", "*.token", "*.refreshToken"],
    censor: "[REDACTED]",
  },
});

// Eventos de segurança que SEMPRE devem ser logados (A09): login ok/falha, refresh reutilizado,
// negação de acesso (403), mudança de senha/e-mail, uso de credenciais administrativas.
logger.warn({ evento: "login_falhou", usuarioId, ip: req.ip }, "tentativa de login inválida");
```

### Permissões mínimas no próprio Node (opcional)

O Node possui um **modelo de permissões** (`--permission`) que restringe o que o processo pode fazer (sistema de
arquivos, processos filhos, workers, rede, conforme a versão). Combine com contêiner não-root:

```bash
node --permission --allow-fs-read=/app --allow-fs-write=/tmp dist/server.js
# as flags disponíveis variam por versão: confira a documentação da sua versão do Node
```

---
