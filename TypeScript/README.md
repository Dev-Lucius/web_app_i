# Super Guia Definitivo de TypeScript — dos Fundamentos à Arquitetura Enterprise

> Guia técnico e exaustivo, organizado em **8 módulos**, que vai da tipagem estática básica à programação em
> nível de tipos (*type gymnastics*), passando por configuração do compilador, monorepos, tipagem de
> ecossistema, validação em runtime, testes, linting, CI/CD, performance e migração de bases JavaScript.

Cada módulo segue a mesma estrutura:

1. **Conceito Teórico** — como o sistema de tipos lida com o cenário (e **por quê**).
2. **Exemplo de Código Prático** — snippets comentados, de básicos a avançados.
3. **Dicas de Ouro / Anti-patterns** — práticas recomendadas e armadilhas a evitar.

---

## Panorama de versões (outubro de 2026)

O TypeScript passou por uma transição importante entre 2025 e 2026. Antes de começar, o que mudou:

| Marco | O que significa |
|-------|-----------------|
| **TypeScript 5.x** | Série que consolidou `satisfies`, parâmetros genéricos `const`, `NoInfer`, predicados de tipo inferidos, `isolatedDeclarations`, `erasableSyntaxOnly` |
| **TypeScript 6.0** (março/2026) | **Última versão baseada no compilador em JavaScript.** Mudou *defaults* (`strict` agora é `true`, `module` = `esnext`, `types` = `[]`, `rootDir` = pasta do `tsconfig`) e **depreciou** opções antigas (`baseUrl`, `target: es5`, `moduleResolution: node10/classic`, `outFile`, AMD/UMD/SystemJS...) |
| **TypeScript 7.0** | **Compilador nativo reescrito em Go**, com builds completos até ~10× mais rápidos. Herda os defaults do 6.0 e transforma as opções depreciadas em **erros** |

> **Consequência prática:** projetos novos devem partir de TS 6/7 com `strict` e `module`/`moduleResolution`
> modernos. Projetos antigos devem **primeiro** migrar para o 6.0 (resolvendo os avisos de depreciação) e só
> então adotar o 7.0. Ferramentas que usam a API programática do compilador (alguns plugins, `ts-jest`,
> `typescript-eslint` em certas versões) podem exigir uma versão específica: verifique a compatibilidade e,
> se necessário, mantenha o TS 6 lado a lado para essas ferramentas.

| Ferramenta | Versão de referência |
|------------|----------------------|
| **ESLint** | 10 (somente *flat config*; o sistema `.eslintrc` foi removido) |
| **typescript-eslint** | v8 (`projectService` para lint com tipos) |
| **Zod** | 4 |
| **Vitest** | Série atual (suporta `expectTypeOf` e modo `typecheck`) |
| **Node.js** | 24 LTS (e 26) — executam `.ts` com *type stripping* apenas para sintaxe "apagável" |

> Versões e *defaults* mudam: confirme sempre nas notas de release oficiais
> ([typescriptlang.org](https://www.typescriptlang.org/), blog do TypeScript) antes de fixar um projeto real.

### Convenções do guia

- Os exemplos assumem `strict: true` (e, onde indicado, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Linhas marcadas com `// @ts-expect-error` são **erros intencionais** que demonstram o que o compilador impede.
  (`@ts-expect-error` falha se o erro *deixar* de existir — por isso é usado em exemplos.)
- `// ❌` e `// ✅` indicam código ruim e código recomendado.
- Para experimentar: [typescriptlang.org/play](https://www.typescriptlang.org/play) ou localmente com
  `npm i -D typescript` + `npx tsc --noEmit`.

---

## Sumário

- [Módulo 1: Fundamentos e Sistema de Tipagem Básica](#módulo-1-fundamentos-e-sistema-de-tipagem-básica)
- [Módulo 2: Tipos Avançados e Utilitários Nativos](#módulo-2-tipos-avançados-e-utilitários-nativos)
- [Módulo 3: Programação Orientada a Objetos e Padrões de Projeto](#módulo-3-programação-orientada-a-objetos-e-padrões-de-projeto)
- [Módulo 4: O Compilador e Configuração Avançada (`tsconfig.json`)](#módulo-4-o-compilador-e-configuração-avançada-tsconfigjson)
- [Módulo 5: Ecossistema, Frameworks e Tipagem de Terceiros](#módulo-5-ecossistema-frameworks-e-tipagem-de-terceiros)
- [Módulo 6: Programação Avançada em Nível de Tipos ("Type Gymnastics")](#módulo-6-programação-avançada-em-nível-de-tipos-type-gymnastics)
- [Módulo 7: Testes, Qualidade de Código e CI/CD](#módulo-7-testes-qualidade-de-código-e-cicd)
- [Módulo 8: Performance do Compilador e Boas Práticas Enterprise](#módulo-8-performance-do-compilador-e-boas-práticas-enterprise)
- [Apêndice A: Linha do tempo de recursos](#apêndice-a-linha-do-tempo-de-recursos)
- [Apêndice B: Checklist enterprise e referências](#apêndice-b-checklist-enterprise-e-referências)

---

# Módulo 1: Fundamentos e Sistema de Tipagem Básica

## 1.1 Conceito Teórico

### O que é o TypeScript

TypeScript é um **superconjunto tipado de JavaScript**: todo JavaScript válido é TypeScript válido, e o
TypeScript acrescenta um **sistema de tipos estático** por cima. Três ideias fundamentais:

1. **Os tipos existem só em tempo de compilação.** Depois de checado, o código é transformado em JavaScript
   puro e **todos os tipos são apagados** (*type erasure*). Não há reflexão de tipos em runtime.
2. **A tipagem é estrutural**, não nominal. Dois tipos são compatíveis se tiverem a **mesma forma**,
   independentemente do nome (*duck typing* verificado em compilação).
3. **O TypeScript não muda a semântica do JavaScript.** Ele só **acusa** erros; não "corrige" o comportamento
   em runtime. Um valor que vem de fora (API, `JSON.parse`, formulário) **não é validado** pelos tipos.

```ts
interface Ponto { x: number; y: number }

class Coordenada { constructor(public x: number, public y: number) {} }

const p: Ponto = new Coordenada(1, 2);   // ✅ compatível: tem a mesma FORMA (tipagem estrutural)
```

### O papel do compilador `tsc`

O `tsc` executa duas tarefas **independentes**:

| Tarefa | O que faz | Pode ser feita por outra ferramenta? |
|--------|-----------|--------------------------------------|
| **Verificação de tipos** (*type checking*) | Analisa o programa e reporta erros de tipo | **Não** — só o compilador do TypeScript (e IDEs via `tsserver`) |
| **Emissão** (*transpilation*) | Remove os tipos e gera JavaScript (+ `.d.ts` + *source maps*) | **Sim** — esbuild, SWC, Babel, Vite, `tsx` e o próprio Node (*type stripping*) apenas **apagam** os tipos, **sem checar** |

```text
   .ts / .tsx
       │
       ▼
  ┌─────────┐   ┌────────┐   ┌─────────┐   ┌───────────┐   ┌──────────┐
  │ Scanner │ → │ Parser │ → │ Binder  │ → │  Checker  │ → │ Emitter  │
  │ (tokens)│   │ (AST)  │   │(símbolos)│   │ (tipos!)  │   │ JS + .d.ts│
  └─────────┘   └────────┘   └─────────┘   └───────────┘   └──────────┘
                                                │ erros de tipo
                                                ▼  (não impedem a emissão, a menos que noEmitOnError)
```

**Consequências práticas importantes:**

- Um projeto pode **rodar** mesmo com erros de tipo (se o transpilador apenas apaga os tipos). Por isso o
  pipeline deve ter uma etapa **explícita** de `tsc --noEmit` (veja Módulos 4 e 7).
- Bundlers/transpiladores exigem que cada arquivo seja transpilável **isoladamente**: é o que a flag
  `isolatedModules` (e `verbatimModuleSyntax`) garante.
- O Node moderno executa `.ts` removendo os tipos, mas **apenas** da sintaxe que pode ser simplesmente
  apagada. Recursos com efeito em runtime (`enum`, `namespace`, *parameter properties*) exigem transformação — a
  flag **`erasableSyntaxOnly`** faz o compilador recusar esses recursos para manter compatibilidade.

```bash
npx tsc --init              # gera um tsconfig.json
npx tsc                     # compila usando o tsconfig.json
npx tsc --noEmit            # só verifica tipos (padrão em CI e com bundlers)
npx tsc --watch             # recompila ao salvar
npx tsc -b                  # modo build (project references)
npx tsc --showConfig        # mostra a configuração final resolvida
npx tsc --explainFiles      # por que cada arquivo entrou na compilação
```

### Tipos primitivos e especiais

| Tipo | Descrição | Observações |
|------|-----------|-------------|
| `string`, `number`, `boolean` | Primitivos comuns | `number` cobre inteiros e decimais (e `NaN`/`Infinity`) |
| `bigint` | Inteiros arbitrariamente grandes | Literais com sufixo `n`; exige `target` ≥ ES2020 |
| `symbol` | Identificadores únicos | `unique symbol` para chaves de propriedade exclusivas |
| `null`, `undefined` | Ausência de valor | Com `strictNullChecks` **não** são atribuíveis aos demais tipos |
| `void` | "Sem retorno útil" | Tipo de retorno de funções que não devolvem valor |
| `never` | **Nenhum valor possível** | Funções que nunca retornam; ramo inalcançável; "fundo" do sistema de tipos |
| `unknown` | **Qualquer valor, mas exige verificação** antes do uso | O tipo seguro para dados externos |
| `any` | **Desliga a checagem** | Contagia tudo que toca; evite |
| `object` | Qualquer valor não-primitivo | Diferente de `Object` e de `{}` (que aceitam primitivos!) |

**`any` × `unknown`** — a distinção mais importante do módulo: `any` diz "confie em mim, não cheque"; `unknown`
diz "pode ser qualquer coisa — prove o que é antes de usar".

**Tipos literais e *widening*.** `const x = 10` tem o tipo literal `10`; `let x = 10` é *alargado*
(*widened*) para `number`. `as const` congela a inferência no nível mais específico e torna tudo `readonly`.

**Anotar × inferir.** Regra de ouro: **anote as fronteiras** (parâmetros e retorno de funções exportadas, campos
públicos) e **deixe o compilador inferir o interior** (variáveis locais, resultados intermediários).

### Arrays, tuplas, enums e objetos

**Arrays:** `T[]` ≡ `Array<T>`; `readonly T[]` ≡ `ReadonlyArray<T>` (sem `push`, `splice`...).

**Tuplas** são arrays de **tamanho e tipos por posição conhecidos**; podem ter rótulos, elementos opcionais,
*rest* e ser `readonly`.

**Enums** geram **código em runtime** (um objeto JavaScript), o que os torna atípicos no TS:

| Forma | Característica |
|-------|----------------|
| `enum E { A, B }` (numérico) | Tem *reverse mapping* (`E[0] === "A"`); historicamente aceitava qualquer `number` |
| `enum E { A = "a" }` (string) | Mais seguro e legível em logs; sem *reverse mapping* |
| `const enum` | Inlinado na compilação; **problemático** com `isolatedModules` e bundlers — evite |
| **`as const` + union** | Sem código extra de runtime, compatível com `erasableSyntaxOnly`; **alternativa preferida** |

**Objetos:** propriedades opcionais (`?`), `readonly`, assinaturas de índice (`[chave: string]: T`) e a
**checagem de propriedades excedentes** (*excess property check*), que só se aplica a **literais de objeto
"frescos"**. O operador **`satisfies`** (TS 4.9+) valida que um valor *respeita* um tipo **sem alargar** o tipo
inferido.

### Unions, Intersections, Type Aliases e Interfaces

- **Union** `A | B`: o valor é **A ou B**. Só é possível acessar os membros **comuns** até que se faça
  *narrowing*.
- **Intersection** `A & B`: o valor é **A e B ao mesmo tempo** (combinação de membros). Propriedades
  conflitantes resultam em `never` na propriedade.

| Critério | **`type`** (alias) | **`interface`** |
|----------|--------------------|-----------------|
| Descreve objetos | ✔ | ✔ |
| Descreve **unions, tuplas, primitivos, funções, mapped/conditional types** | ✔ | ❌ (objetos e assinaturas) |
| **Declaration merging** (declarações com mesmo nome se fundem) | ❌ (erro de duplicidade) | ✔ (útil para estender tipos de bibliotecas) |
| Extensão | `&` (intersecção) | `extends` (**verifica compatibilidade**, mensagens de erro melhores) |
| Implementável por `class` | ✔ (se for forma de objeto) | ✔ |
| Desempenho | Intersections grandes podem custar mais | Interfaces são **nomeadas e cacheadas** — costumam ser mais eficientes |
| Uso típico | Unions, utilitários, computação de tipos | **Contratos de objetos/API pública**, tipos extensíveis |

**Recomendação prática:**

- `interface` para **formas de objetos** que serão estendidas, implementadas por classes ou fazem parte de uma
  API pública (e quando você quiser *declaration merging*).
- `type` para **unions, tuplas, funções, mapped/conditional/template types** e composição.
- Seja **consistente** na equipe e imponha por lint (`@typescript-eslint/consistent-type-definitions`).

### *Type Narrowing* e *Type Guards*

O compilador faz **análise de fluxo de controle**: a cada `if`, `switch`, `return` ou atribuição, ele
**refina** o tipo de uma variável dentro daquele ramo. Isso é *narrowing*.

| Técnica | Exemplo | O que refina |
|---------|---------|--------------|
| `typeof` | `typeof x === "string"` | Primitivos (`"string"`, `"number"`, `"boolean"`, `"bigint"`, `"symbol"`, `"undefined"`, `"function"`, `"object"`) — **cuidado:** `typeof null === "object"` |
| Verdade (*truthiness*) | `if (x)` | Remove `null`/`undefined`/`0`/`""`/`false` — cuidado com `0` e `""` válidos |
| Igualdade | `x === undefined`, `x == null` | `== null` remove **null e undefined** |
| `in` | `"miar" in animal` | Distingue objetos pela presença de propriedade |
| `instanceof` | `e instanceof Error` | Classes/construtores |
| **Discriminante** | `forma.tipo === "circulo"` | *Discriminated unions* (propriedade literal em comum) |
| **Type predicate** | `function ehX(v): v is X` | Guard **customizado** |
| **Assertion function** | `function assert(c): asserts c` | Lança erro **ou** refina o tipo após a chamada |

**Predicados de tipo são uma promessa:** o compilador **confia** no `v is X` sem verificar a implementação.
Um guard escrito errado "mente" ao sistema de tipos. A partir do **TS 5.5**, o compilador **infere** predicados
em casos simples (ex.: `.filter(x => x !== undefined)` já produz `T[]` sem `undefined`).

## 1.2 Exemplos de Código Prático

### Do TypeScript ao JavaScript (apagamento de tipos)

```ts
// src/soma.ts
interface Usuario {
  id: number;
  nome: string;
}

function soma(a: number, b: number): number {
  return a + b;
}

const u: Usuario = { id: 1, nome: "Ana" };
console.log(soma(u.id, 2));
```

```js
// dist/soma.js (saída): interface e anotações DESAPARECEM
function soma(a, b) {
  return a + b;
}
const u = { id: 1, nome: "Ana" };
console.log(soma(u.id, 2));
```

### Primitivos, inferência e literais

```ts
const nome: string = "Ana";
const idade: number = 30;
const ativo: boolean = true;
const grande: bigint = 9_007_199_254_740_993n;
const id: symbol = Symbol("id");

let x = 10;                 // number  (widening)
const y = 10;               // 10      (literal)
const misto = [1, "a"];     // (string | number)[]

let tema = "claro" as const;                      // "claro"
const config = { modo: "dev", porta: 3000 } as const;
// tipo: { readonly modo: "dev"; readonly porta: 3000 }
```

### `any` × `unknown` × `never` × `void`

```ts
declare const qualquer: any;
qualquer.foo.bar.baz();            // compila! `any` desliga a checagem (e explode em runtime)

declare const desconhecido: unknown;
// @ts-expect-error — `unknown` não permite acesso sem narrowing
desconhecido.toUpperCase();

function analisar(entrada: unknown): string {
  if (typeof entrada === "string") return entrada.toUpperCase();   // narrowing → string
  if (typeof entrada === "number") return entrada.toFixed(2);       // narrowing → number
  return String(entrada);
}

function falhar(mensagem: string): never {
  throw new Error(mensagem);                // nunca retorna
}

function registrar(msg: string): void {
  console.log(msg);                          // sem valor de retorno útil
}
```

### Arrays e tuplas

```ts
const numeros: number[] = [1, 2, 3];
const nomes: Array<string> = ["a", "b"];

const fixo: readonly number[] = [1, 2, 3];
// @ts-expect-error — readonly não tem push
fixo.push(4);

// Tuplas rotuladas (os rótulos documentam e aparecem no IntelliSense)
type Coordenada = [latitude: number, longitude: number];
const saoPaulo: Coordenada = [-23.55, -46.63];

type Resposta = [status: number, corpo?: string];          // elemento opcional
type Linha = [id: string, ...valores: number[]];            // rest em tupla
type ComFim<T extends unknown[]> = [...T, "fim"];           // tupla variádica
type Teste = ComFim<[1, 2]>;                                // [1, 2, "fim"]

const par = [1, "a"] as const;                              // readonly [1, "a"]

// Retornar tuplas permite "múltiplos valores" tipados (como useState)
function dividir(a: number, b: number): [quociente: number, resto: number] {
  return [Math.trunc(a / b), a % b];
}
const [q, r] = dividir(17, 5);
```

> Com **`noUncheckedIndexedAccess`**, `numeros[0]` passa a ser `number | undefined`, o que obriga a tratar o
> acesso fora dos limites. Em tuplas, o índice **conhecido** (`saoPaulo[0]`) continua sendo `number`.

### Enums × `as const`

```ts
enum Status {
  Ativo = "ATIVO",
  Inativo = "INATIVO",
}   // gera um objeto JS em runtime

// ✅ Alternativa sem código extra e compatível com erasableSyntaxOnly
const PAPEL = {
  ADMIN: "admin",
  USUARIO: "usuario",
  CONVIDADO: "convidado",
} as const;

type Papel = (typeof PAPEL)[keyof typeof PAPEL];   // "admin" | "usuario" | "convidado"

function podeEditar(papel: Papel): boolean {
  return papel === PAPEL.ADMIN || papel === PAPEL.USUARIO;
}

podeEditar("admin");
// @ts-expect-error — "root" não pertence à união
podeEditar("root");

// Lista de valores em runtime, derivada da MESMA fonte de verdade:
const todosOsPapeis = Object.values(PAPEL);        // ("admin" | "usuario" | "convidado")[]
```

### Objetos: opcionais, `readonly`, índices, propriedades excedentes e `satisfies`

```ts
interface Livro {
  readonly id: string;               // não pode ser reatribuída
  titulo: string;
  subtitulo?: string;                // opcional: string | undefined
  anoPublicacao: number;
}

const livro: Livro = { id: "1", titulo: "O Hobbit", anoPublicacao: 1937 };
// @ts-expect-error — propriedade somente leitura
livro.id = "2";

// Assinatura de índice: dicionário
const estoque: Record<string, number> = { hobbit: 3, silmarillion: 1 };

// Excess property check: só em literais "frescos"
interface Ponto { x: number; y: number }
// @ts-expect-error — 'z' não existe em Ponto
const p1: Ponto = { x: 1, y: 2, z: 3 };

const dados = { x: 1, y: 2, z: 3 };
const p2: Ponto = dados;                 // ✅ OK: não é literal fresco (tipagem estrutural)
```

```ts
// satisfies: valida o formato SEM perder a precisão do tipo inferido
type Cores = Record<"primaria" | "secundaria", string | [number, number, number]>;

// ❌ Com anotação, o tipo vira a união larga e perdemos informação
const coresAnotadas: Cores = { primaria: [255, 0, 0], secundaria: "#00f" };
// @ts-expect-error — `primaria` é "string | [number, number, number]": `.map` não existe em string
coresAnotadas.primaria.map((c) => c / 255);

// ✅ Com satisfies: validado contra Cores, mas cada propriedade mantém o seu tipo preciso
const cores = { primaria: [255, 0, 0], secundaria: "#00f" } satisfies Cores;
cores.primaria.map((c) => c / 255);       // ainda é a tupla
cores.secundaria.toUpperCase();           // ainda é string
```

### Unions e Intersections

```ts
type Id = string | number;

function formatarId(id: Id): string {
  // id.toFixed(0);                // ❌ só membros COMUNS a string e number podem ser usados
  return typeof id === "string" ? id.trim() : id.toFixed(0);   // ✅ após narrowing
}

type Identificavel = { id: string };
type Auditavel = { criadoEm: Date; atualizadoEm: Date };
type Entidade = Identificavel & Auditavel;          // possui TODAS as propriedades

const e: Entidade = { id: "1", criadoEm: new Date(), atualizadoEm: new Date() };

// Conflito em intersecção: a propriedade vira `never`
type Conflito = { valor: string } & { valor: number };
declare const c: Conflito;
const v: never = c.valor;           // string & number = never
```

### `interface` × `type` na prática

```ts
// 1) Declaration merging: só interfaces
interface Configuracao { host: string }
interface Configuracao { porta: number }      // as duas declarações se fundem
const cfg: Configuracao = { host: "localhost", porta: 3000 };

// Uso clássico: estender tipos de bibliotecas (ex.: Window)
declare global {
  interface Window { appVersion: string }
}

// 2) Só `type` consegue: unions, tuplas, funções, computados
type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };
type Manipulador = (evento: Event) => void;
type Chaves<T> = keyof T;

// 3) extends (interface) vs & (type)
interface Animal { nome: string }
interface Cachorro extends Animal { raca: string }          // erro claro se houver incompatibilidade
type Gato = Animal & { vidas: number };

// 4) Ambos podem ser implementados por classes
class Labrador implements Cachorro {
  nome = "Rex";
  raca = "Labrador";
}
```

### *Narrowing* com `typeof`, igualdade, `in` e `instanceof`

```ts
function tamanho(valor: string | string[] | null | undefined): number {
  if (valor == null) return 0;                 // remove null E undefined
  if (typeof valor === "string") return valor.length;    // string
  return valor.length;                          // string[]
}

interface Gato { miar(): void }
interface Cao { latir(): void }

function falar(animal: Gato | Cao): void {
  if ("miar" in animal) animal.miar();          // narrowing por presença de propriedade
  else animal.latir();
}

function mensagemDe(erro: unknown): string {
  if (erro instanceof Error) return erro.message;          // classes
  if (typeof erro === "string") return erro;
  return "erro desconhecido";
}

try {
  JSON.parse("{");
} catch (e) {                                  // com strict, `e` é `unknown` (useUnknownInCatchVariables)
  console.error(mensagemDe(e));
}
```

### *Type guards* customizados e *assertion functions*

```ts
interface Usuario { id: string; nome: string }

// Predicado de tipo: "se retornar true, v é Usuario"
function ehUsuario(v: unknown): v is Usuario {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v && typeof v.id === "string" &&       // `in` refina `v` para object & Record<"id", unknown>
    "nome" in v && typeof v.nome === "string"
  );
}

function processar(entrada: unknown) {
  if (ehUsuario(entrada)) {
    console.log(entrada.nome.toUpperCase());       // entrada: Usuario
  }
}

// Assertion functions: lançam erro OU refinam o tipo para o resto do escopo
function assert(condicao: unknown, mensagem: string): asserts condicao {
  if (!condicao) throw new Error(mensagem);
}

function assertString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new TypeError("esperava string");
}

function exemplo(v: string | undefined, bruto: unknown) {
  assert(v !== undefined, "v é obrigatório");
  v.toUpperCase();                    // v: string (refinado pela assertion)

  assertString(bruto);
  bruto.trim();                       // bruto: string
}

// TS 5.5+: o compilador INFERE o predicado em funções simples
const lista = [1, undefined, 3];
const numeros = lista.filter((n) => n !== undefined);     // number[]  (antes: (number | undefined)[])

// Utilitário reutilizável
const estaDefinido = <T>(v: T | null | undefined): v is T => v != null;
const limpos = [1, null, 2, undefined].filter(estaDefinido);   // number[]
```

### Union discriminada (prévia do Módulo 3)

```ts
type Forma =
  | { tipo: "circulo"; raio: number }
  | { tipo: "quadrado"; lado: number }
  | { tipo: "retangulo"; largura: number; altura: number };

function area(forma: Forma): number {
  switch (forma.tipo) {                   // o discriminante refina `forma` em cada `case`
    case "circulo":
      return Math.PI * forma.raio ** 2;
    case "quadrado":
      return forma.lado ** 2;
    case "retangulo":
      return forma.largura * forma.altura;
  }
}
```

## 1.3 Dicas de Ouro / Anti-patterns

**✅ Faça**

- Ative **`strict`** desde o primeiro dia (no TS 6+ já é o padrão). Migrar depois é muito mais caro.
- Use **`unknown`** para dados externos (`JSON.parse`, `fetch`, `catch`) e **faça narrowing/validação** antes de usar.
- **Anote** parâmetros e retornos de funções exportadas; **infira** variáveis locais.
- Prefira **`as const` + union** a `enum` (menos código gerado, melhor com `erasableSyntaxOnly` e bundlers).
- Use **`satisfies`** para validar configurações/dicionários sem alargar o tipo.
- Modele estados com **unions discriminadas** em vez de vários campos opcionais (Módulo 3).
- Prefira **`readonly`/`as const`/`ReadonlyArray`** por padrão; permita mutação só quando necessário.
- Escreva **type guards** pequenos, testados e que **realmente** verificam o que prometem.

**❌ Nunca faça**

- **`any` por conveniência.** Ele se espalha: tudo que toca um `any` perde a checagem. Use `unknown` + narrowing.
- **`as` para "calar" o compilador** (`dados as Usuario`): você está **mentindo** ao sistema de tipos. Valide em runtime.
- **`!` (non-null assertion)** como atalho: `valor!.campo` transforma um possível `undefined` em *crash* em runtime.
- Usar os tipos **`Object`, `{}` e `Function`** (aceitam quase qualquer coisa, inclusive primitivos): use `object`,
  `Record<string, unknown>` ou assinaturas de função específicas.
- Esperar que **tipos validem dados em runtime** — eles desaparecem após a compilação.
- Usar **`const enum`** ou **enums numéricos** abertos a qualquer `number`.
- Escrever **type guards que mentem** (`v is Usuario` retornando `true` sem checar nada).
- Misturar **`interface` e `type`** sem critério na mesma base de código.
- **Anotar tudo** (`const x: number = 1`): ruído sem ganho.
- Confiar em `typeof x === "object"` sem excluir `null`.

---
