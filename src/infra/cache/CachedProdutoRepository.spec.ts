import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedProdutoRepository } from './CachedProdutoRepository.js';
import { InMemoryCacheStore } from '../../shared/testing/InMemoryCacheStore.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';

describe('CachedProdutoRepository', () => {
  let origem: InMemoryProdutoRepository;
  let cache: InMemoryCacheStore;
  let repo: CachedProdutoRepository;
  let agora: number;

  beforeEach(async () => {
    agora = 1_000_000;
    origem = new InMemoryProdutoRepository();
    cache = new InMemoryCacheStore(() => agora);
    repo = new CachedProdutoRepository(origem, cache, { ttlProdutoSegundos: 60 });
    await origem.adicionar(makeProduto({ id: 'a', nome: 'Mouse', preco: 100 }));
  });

  describe('buscarPorId', () => {
    it('MISS: busca na origem e guarda no cache', async () => {
      const espiao = vi.spyOn(origem, 'buscarPorId');

      const p = await repo.buscarPorId('a');

      expect(p?.nome).toBe('Mouse');
      expect(espiao).toHaveBeenCalledTimes(1);
      expect(cache.tem('produto:a')).toBe(true);
    });

    it('HIT: a segunda leitura NÃO vai à origem', async () => {
      //como o comeco do teste ta vazio ele busca na origem pra ter no cache depois
      await repo.buscarPorId('a');
      const espiao = vi.spyOn(origem, 'buscarPorId');

      const p = await repo.buscarPorId('a');

      expect(espiao).not.toHaveBeenCalled();
      expect(p?.nome).toBe('Mouse');
    });

    it('o produto vindo do cache é uma entity funcional (VOs reconstruídos)', async () => {
      await repo.buscarPorId('a');

      const doCache = (await repo.buscarPorId('a'))!;

      expect(doCache.preco.valor).toBe(100);
      expect(doCache.estaDisponivel()).toBe(true);
      expect(doCache.criadoEm).toBeInstanceOf(Date);
    });

    it('não cacheia null', async () => {
      expect(await repo.buscarPorId('nao-existe')).toBeNull();
      expect(cache.tem('produto:nao-existe')).toBe(false);
    });

    it('expira após o TTL e volta a consultar a origem', async () => {
      await repo.buscarPorId('a');
      agora += 61_000; // avança o relógio 61s
      const espiao = vi.spyOn(origem, 'buscarPorId');

      await repo.buscarPorId('a');

      expect(espiao).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalidação', () => {
    it('atualizar apaga o cache do produto e a próxima leitura vê o dado novo', async () => {
      await repo.buscarPorId('a');
      const p = (await origem.buscarPorId('a'))!;
      p.alterarPreco(999);

      await repo.atualizar(p);

      expect((await repo.buscarPorId('a'))?.preco.valor).toBe(999);
    });

    it('deletar remove do cache', async () => {
      await repo.buscarPorId('a');

      await repo.deletar('a');

      expect(cache.tem('produto:a')).toBe(false);
      expect(await repo.buscarPorId('a')).toBeNull();
    });

    it('adicionar invalida as listagens (nova versão)', async () => {
      const filtro = { limite: 10, deslocamento: 0 };
      expect((await repo.buscarPaginado(filtro)).total).toBe(1);

      await repo.adicionar(makeProduto({ id: 'b', nome: 'Teclado' }));

      expect((await repo.buscarPaginado(filtro)).total).toBe(2);
    });

    it('atualizar invalida as listagens', async () => {
      const filtro = { limite: 10, deslocamento: 0 };
      await repo.buscarPaginado(filtro);
      const p = (await origem.buscarPorId('a'))!;
      p.renomear('Mouse Pro');

      await repo.atualizar(p);

      expect((await repo.buscarPaginado(filtro)).itens[0].nome).toBe('Mouse Pro');
    });
  });

  describe('buscarPaginado', () => {
    it('HIT: mesma consulta não vai à origem', async () => {
      const filtro = { limite: 10, deslocamento: 0 };
      await repo.buscarPaginado(filtro);
      const espiao = vi.spyOn(origem, 'buscarPaginado');

      await repo.buscarPaginado(filtro);

      expect(espiao).not.toHaveBeenCalled();
    });

    it('filtros diferentes usam chaves diferentes', async () => {
      await origem.adicionar(makeProduto({ id: 'b', nome: 'Teclado' }));

      const todos = await repo.buscarPaginado({ limite: 10, deslocamento: 0 });
      const soMouse = await repo.buscarPaginado({ nome: 'mouse', limite: 10, deslocamento: 0 });

      expect(todos.total).toBe(2);
      expect(soMouse.total).toBe(1);
    });

    it('preserva total e itens vindos do cache', async () => {
      const filtro = { limite: 1, deslocamento: 0 };
      await origem.adicionar(makeProduto({ id: 'b', nome: 'Teclado' }));
      await repo.buscarPaginado(filtro);

      const doCache = await repo.buscarPaginado(filtro);

      expect(doCache.total).toBe(2);
      expect(doCache.itens).toHaveLength(1);
    });
  });

  describe('delegação sem cache', () => {
    it('existeComNome sempre consulta a origem (precisa ser exato)', async () => {
      const espiao = vi.spyOn(origem, 'existeComNome');

      await repo.existeComNome('mouse');
      await repo.existeComNome('mouse');

      expect(espiao).toHaveBeenCalledTimes(2);
    });
  });

  describe('Redis fora do ar (fail-open)', () => {
    it('continua funcionando, lendo da origem', async () => {
      cache.falhando = true;

      expect((await repo.buscarPorId('a'))?.nome).toBe('Mouse');
      expect((await repo.buscarPaginado({ limite: 10, deslocamento: 0 })).total).toBe(1);
    });

    it('escritas continuam gravando na origem', async () => {
      cache.falhando = true;

      await repo.adicionar(makeProduto({ id: 'z', nome: 'Novo' }));

      expect(await origem.buscarPorId('z')).not.toBeNull();
    });
  });
});
