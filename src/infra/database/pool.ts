import 'dotenv/config';
import { Pool } from 'pg';

//Driver oficial do PostgreSQL para Node.js. É o que vai conectar sua app ao banco
export function criarPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida');
  }
  return new Pool({
    connectionString,
    max: 10,                       //máximo de conexões simultâneas
    idleTimeoutMillis: 30_000,     //fecha conexão ociosa após 30s
    connectionTimeoutMillis: 5_000 //falha se não conseguir conexão em 5s
  });
}