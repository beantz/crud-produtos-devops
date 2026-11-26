import { afterAll, beforeAll } from 'vitest';
import type { Pool } from 'pg';
import { criarPool } from '../database/pool.js';
import { PostgresProdutoRepository } from './PostgresProdutoRepository.js';
import { testarContratoProdutoRepository } from './produtoRepositoryContract.js';

let pool: Pool;

beforeAll(() => {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error('DATABASE_URL_TEST não definida');
  pool = criarPool(url);
});

afterAll(async () => {
  await pool.end();
});

testarContratoProdutoRepository('PostgresProdutoRepository', async () => {
  await pool.query('TRUNCATE TABLE produtos'); //esvazia as tabelas e os ids começam por 1 de novo
  return new PostgresProdutoRepository(pool);
});
