import { describe, it, expect, beforeEach } from 'vitest';
import type { ProdutoRepository } from '../../application/interfaces/ProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';

//testa os repositories
export function testarContratoProdutoRepository(
  //suite pode ser InMemoryProdutoRepository" ou "PostgresProdutoRepository
  nomeSuite: string,
  criarRepo: () => Promise<ProdutoRepository>,
) {
  describe(`${nomeSuite} (contrato)`, () => {
    let repo: ProdutoRepository;

    beforeEach(async () => {
      repo = await criarRepo(); //repositório limpo a cada teste
    });

    it('adiciona e busca por id', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Mouse', preco: 129.9, quantidade: 3 }));

      const p = await repo.buscarPorId('a');

      expect(p?.nome).toBe('Mouse');
      expect(p?.preco.valor).toBe(129.9);       //pega o bug do numeric como string
      expect(p?.quantidade.valor).toBe(3);
    });

    it('buscarPorId devolve null quando não existe', async () => {
      expect(await repo.buscarPorId('nao-existe')).toBeNull();
    });

    it('preserva as datas', async () => {
      const original = makeProduto({ id: 'a' });
      await repo.adicionar(original);

      const lido = await repo.buscarPorId('a');

      expect(lido?.criadoEm.getTime()).toBe(original.criadoEm.getTime());
    });

    it('rejeita id duplicado', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Uma' }));

      await expect(repo.adicionar(makeProduto({ id: 'a', nome: 'Dois' })))
        .rejects.toThrow(DuplicateProductError);
    });

    it('atualiza e persiste', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Mouse', preco: 10 }));
      const p = (await repo.buscarPorId('a'))!;
      p.alterarPreco(20);

      await repo.atualizar(p);

      expect((await repo.buscarPorId('a'))?.preco.valor).toBe(20);
    });

    it('atualizar lança NotFoundError se não existe', async () => {
      await expect(repo.atualizar(makeProduto({ id: 'fantasma' })))
        .rejects.toThrow(NotFoundError);
    });

    it('deletar remove e é idempotente', async () => {
      await repo.adicionar(makeProduto({ id: 'a' }));

      await repo.deletar('a');
      await repo.deletar('a'); //segunda vez não lança

      expect(await repo.buscarPorId('a')).toBeNull();
    });

    it('existeComNome ignora maiúsculas e respeita ignorarId', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Xbox' }));

      expect(await repo.existeComNome('XBOX')).toBe(true);
      expect(await repo.existeComNome('XBOX', 'a')).toBe(false);
      expect(await repo.existeComNome('PS5')).toBe(false);
    });

    it('buscarPaginado: total vem antes do corte e a ordem é estável', async () => {
      for (let i = 1; i <= 25; i++) {
        await repo.adicionar(makeProduto({ id: `id-${String(i).padStart(2, '0')}`, nome: `Produto ${i}` }));
      }

      const r = await repo.buscarPaginado({ limite: 10, deslocamento: 20 });

      expect(r.total).toBe(25);
      expect(r.itens).toHaveLength(5);
    });

    it('buscarPaginado filtra por nome e disponibilidade', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Xbox 360', quantidade: 1 }));
      await repo.adicionar(makeProduto({ id: 'b', nome: 'Xbox One', quantidade: 0 }));
      await repo.adicionar(makeProduto({ id: 'c', nome: 'PS5', quantidade: 1 }));

      const r = await repo.buscarPaginado({
        nome: 'xbox', apenasDisponiveis: true, limite: 10, deslocamento: 0,
      });

      expect(r.total).toBe(1);
      expect(r.itens[0].nome).toBe('Xbox 360');
    });

    it('buscarPorNomeContendo não trata % como curinga', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Cabo 100% cobre' }));
      await repo.adicionar(makeProduto({ id: 'b', nome: 'Mouse' }));

      expect(await repo.buscarPorNomeContendo('%')).toHaveLength(1);
    });
  });
}