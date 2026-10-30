import { PostgresProdutoRepository } from "../repositories/PostgresProdutoRepository.js";
import { PostgresUnitOfWork } from "./PostgresUnitOfWork.js";
import { makeProduto } from "../../shared/testing/makeProduto.js";
import {beforeAll, it, expect, afterAll, beforeEach } from 'vitest';
import type { Pool } from 'pg';
import { criarPool } from '../database/pool.js';

let pool: Pool;

beforeAll(() => {
  pool = criarPool(process.env.DATABASE_URL_TEST); //usa banco de testes
});

beforeEach(async () => {
  await pool.query('DELETE FROM produtos');
  const repo = new PostgresProdutoRepository(pool);
  await repo.adicionar(makeProduto({ id: 'id_2', nome: 'ABCDEF', quantidade: 10 }));
});

afterAll(async () => {
  await pool.end();
});

it('desfaz tudo quando algo falha no meio', async () => {
  const uow = new PostgresUnitOfWork(pool);
  const repo = new PostgresProdutoRepository(pool);

  await expect(
    uow.executar(async ({ produtos }) => {
      const id_2 = (await produtos.buscarPorId('id_2'))!;
      id_2.removerEstoque(5);
      await produtos.atualizar(id_2);
      throw new Error('falha simulada');
    }),
  ).rejects.toThrow('falha simulada');

  expect((await repo.buscarPorId('id_2'))?.quantidade.valor).toBe(10); // nada foi gravado
});

it('confirma tudo quando dá certo (commit)', async () => {
  // ... mesmo setup, sem lançar erro; espera quantidade 5
  const uow = new PostgresUnitOfWork(pool);
  const repo = new PostgresProdutoRepository(pool);

  await uow.executar(async ({ produtos }) => {

    const p = await produtos.buscarPorId('id_2');
    expect(p).not.toBeNull();
    p!.removerEstoque(5);
    await produtos.atualizar(p!);

  });

  expect((await repo.buscarPorId('id_2'))?.quantidade.valor).toBe(5);
});