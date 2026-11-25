import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { PostgresProdutoRepository } from './PostgresProdutoRepository.js';
import { Pool } from 'pg';
import { criarPool } from '../database/pool.js'; 

describe('PostgresProdutoRepository: erros específicos', () => {
  let pool: Pool;
  let repo: PostgresProdutoRepository;

  beforeAll(() => {
    const url = process.env.DATABASE_URL_TEST;
    if (!url) throw new Error('DATABASE_URL_TEST não definida');
    pool = criarPool(url);
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE produtos CASCADE');
    repo = new PostgresProdutoRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('nome duplicado vira DuplicateProductError', async () => {
    await repo.adicionar(makeProduto({ id: 'a', nome: 'Xbox' }));
    await expect(repo.adicionar(makeProduto({ id: 'b', nome: '  XBOX ' })))
      .rejects.toThrow(DuplicateProductError); 
  });

  it('SQL injection no filtro de nome é tratado como texto', async () => {
    await repo.adicionar(makeProduto({ id: 'a', nome: 'Mouse' }));
    const r = await repo.buscarPaginado({ nome: "'; DROP TABLE produtos; --", limite: 10, deslocamento: 0 });
    expect(r.total).toBe(0);
    expect((await repo.buscarPorId('a'))).not.toBeNull();
  });

  it('LIKE: "_" não é curinga', async () => {
    await repo.adicionar(makeProduto({ id: 'a', nome: 'Cabo A_B' }));
    await repo.adicionar(makeProduto({ id: 'b', nome: 'Cabo AXB' }));
    expect(await repo.buscarPorNomeContendo('A_B')).toHaveLength(1);
  });

  it('constraint CHECK barra quantidade negativa inserida por fora da entity', async () => {
    await expect(
      pool.query(
        `INSERT INTO produtos VALUES ('x','Nome X', 10, -1, now(), now())`,
      ),
    ).rejects.toThrow(/produtos_quantidade_nao_negativa/);
  });

  it('paginação é estável, sem repetição entre páginas', async () => {
    for (let i = 0; i < 25; i++) {
      await repo.adicionar(makeProduto({ id: `id-${String(i).padStart(2, '0')}`, nome: `Produto ${i}` }));
    }
    const p1 = await repo.buscarPaginado({ limite: 10, deslocamento: 0 });
    const p2 = await repo.buscarPaginado({ limite: 10, deslocamento: 10 });
    const ids1 = p1.itens.map((p) => p.id);
    expect(p2.itens.some((p) => ids1.includes(p.id))).toBe(false);
  });
});