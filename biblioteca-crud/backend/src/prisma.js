// Arquivo responsável por configurar o Prisma Client
// e a conexão com o banco de dados Neon.

import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

import { PrismaClient } from "./generated/prisma/client.ts";

// Configura o WebSocket para funcionar no Node.js.
neonConfig.webSocketConstructor = ws;

// Recupera a URL de conexão do ambiente.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não foi configurada.");
}

// Cria o adaptador específico do Neon.
const adapter = new PrismaNeon({
    connectionString,
});

// Instancia o Prisma Client.
export const prisma = new PrismaClient({
    adapter,
});