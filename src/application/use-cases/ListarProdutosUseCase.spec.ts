import { describe, it, expect, beforeEach } from 'vitest';
import { ListarProdutosUseCase } from './ListarProdutosUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';

describe('ListarProdutosUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: ListarProdutosUseCase;

  beforeEach(() => {
    repo = new InMemoryProdutoRepository();
    sut = new ListarProdutosUseCase(repo);
  });

  async function popular(qtd: number) {
    for (let i = 1; i <= qtd; i++) {
      await repo.adicionar(makeProduto({ id: `id-${i}`, nome: `Produto ${i}` }));
    }
  }

  describe('valores padrão', () => {
    it('devolve lista vazia quando não há produtos', async () => {
      const output = await sut.executar();

      expect(output.itens).toEqual([]);
      expect(output.total).toBe(0);
      expect(output.totalPaginas).toBe(0);
    });

    it('usa página 1 e limite 10 por padrão', async () => {
      const output = await sut.executar();

      expect(output.pagina).toBe(1);
      expect(output.limite).toBe(10);
    });
  });

  describe('paginação', () => {
    it('divide 25 itens em 3 páginas (10, 10, 5)', async () => {
      await popular(25);

      const p1 = await sut.executar({ pagina: 1, limite: 10 });
      const p2 = await sut.executar({ pagina: 2, limite: 10 });
      const p3 = await sut.executar({ pagina: 3, limite: 10 });

      expect(p1.itens).toHaveLength(10);
      expect(p2.itens).toHaveLength(10);
      expect(p3.itens).toHaveLength(5);
      expect(p1.total).toBe(25);
      expect(p1.totalPaginas).toBe(3);
    });

    it('mantém a ordem de inserção entre páginas', async () => {
      await popular(25);

      const p2 = await sut.executar({ pagina: 2, limite: 10 });
      const p3 = await sut.executar({ pagina: 3, limite: 10 });

      expect(p2.itens[0].nome).toBe('Produto 11');
      expect(p3.itens[0].nome).toBe('Produto 21');
    });

    it('não repete itens entre páginas', async () => {
      await popular(25);

      const p1 = await sut.executar({ pagina: 1, limite: 10 });
      const p2 = await sut.executar({ pagina: 2, limite: 10 });

      const ids1 = p1.itens.map((i) => i.id);
      const ids2 = p2.itens.map((i) => i.id);
      expect(ids1.filter((id) => ids2.includes(id))).toEqual([]);
    });

    it('devolve página vazia (mas com total) além do fim', async () => {
      await repo.adicionar(makeProduto());

      const output = await sut.executar({ pagina: 10, limite: 10 });

      expect(output.itens).toEqual([]);
      expect(output.total).toBe(1);
    });

    it('calcula totalPaginas arredondando para cima', async () => {
      await popular(21);

      const output = await sut.executar({ limite: 10 });

      expect(output.totalPaginas).toBe(3);
    });
  });

  describe('normalização de entrada', () => {
    it.each([0, -5])('trata página %i como 1', async (pagina) => {
      const output = await sut.executar({ pagina });
      expect(output.pagina).toBe(1);
    });

    it('trata página decimal arredondando para baixo', async () => {
      const output = await sut.executar({ pagina: 2.7 });
      expect(output.pagina).toBe(2);
    });

    it('trata página NaN como 1', async () => {
      const output = await sut.executar({ pagina: NaN });
      expect(output.pagina).toBe(1);
    });

    it('limita o limite máximo a 100', async () => {
      const output = await sut.executar({ limite: 500 });
      expect(output.limite).toBe(100);
    });

    it('limita o limite mínimo a 1', async () => {
      const output = await sut.executar({ limite: 0 });
      expect(output.limite).toBe(1);
    });
  });

  describe('filtros', () => {
    it('filtra por nome ignorando maiúsculas', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Xbox Series X' }));
      await repo.adicionar(makeProduto({ id: 'b', nome: 'PlayStation 5' }));
      await repo.adicionar(makeProduto({ id: 'c', nome: 'Xbox Series S' }));

      const output = await sut.executar({ nome: 'XBOX' });

      expect(output.itens).toHaveLength(2);
      expect(output.total).toBe(2);
    });

    it('filtra apenas disponíveis e o total considera só eles', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Produto A', quantidade: 10 }));
      await repo.adicionar(makeProduto({ id: 'b', nome: 'Produto B', quantidade: 0 }));

      const output = await sut.executar({ apenasDisponiveis: true });

      expect(output.itens).toHaveLength(1);
      expect(output.itens[0].nome).toBe('Produto A');
      expect(output.total).toBe(1);
    });

    it('combina filtro de nome e disponibilidade', async () => {
      await repo.adicionar(makeProduto({ id: 'a', nome: 'Xbox 360', quantidade: 10 }));
      await repo.adicionar(makeProduto({ id: 'b', nome: 'Xbox One', quantidade: 0 }));
      await repo.adicionar(makeProduto({ id: 'c', nome: 'PS5', quantidade: 10 }));

      const output = await sut.executar({ nome: 'xbox', apenasDisponiveis: true });

      expect(output.itens).toHaveLength(1);
      expect(output.itens[0].nome).toBe('Xbox 360');
    });

    it('devolve vazio quando o filtro não encontra nada', async () => {
      await repo.adicionar(makeProduto());

      const output = await sut.executar({ nome: 'inexistente' });

      expect(output.itens).toEqual([]);
      expect(output.totalPaginas).toBe(0);
    });
  });
});