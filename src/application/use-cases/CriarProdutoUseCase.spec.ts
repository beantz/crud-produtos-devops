import { describe, it, expect, beforeEach } from 'vitest';
import { CriarProdutoUseCase } from './CriarProdutoUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { FakeIdGenerator } from '../../shared/testing/FakeIdGenerator.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { ValidationError } from '../../domain/errors/ValidationError.js';

describe('CriarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: CriarProdutoUseCase;

  beforeEach(() => {
    repo = new InMemoryProdutoRepository();
    sut = new CriarProdutoUseCase(repo, new FakeIdGenerator());
  });

  it('cria o produto e devolve o DTO', async () => {
    const output = await sut.executar({ nome: 'Xbox Series X', preco: 4500, quantidade: 10 });

    expect(output).toMatchObject({
      id: 'id-1',
      nome: 'Xbox Series X',
      preco: 4500,
      quantidade: 10,
      disponivel: true,
    });
  });

  it('realmente persiste no repositório', async () => {
    await sut.executar({ nome: 'Xbox Series X', preco: 4500, quantidade: 10 });

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo).not.toBeNull();
    expect(salvo?.nome).toBe('Xbox Series X');
  });

  it('usa o IdGenerator para cada produto', async () => {
    await sut.executar({ nome: 'Produto A', preco: 10, quantidade: 1 });
    await sut.executar({ nome: 'Produto B', preco: 20, quantidade: 2 });

    expect(repo.items.map((p) => p.id)).toEqual(['id-1', 'id-2']);
  });

  it('rejeita nome duplicado ignorando maiúsculas, e não persiste', async () => {
    await repo.adicionar(makeProduto({ id: 'x', nome: 'Xbox' }));

    await expect(
      sut.executar({ nome: 'xbox', preco: 100, quantidade: 1 }),
    ).rejects.toThrow(DuplicateProductError);

    expect(repo.items).toHaveLength(1);
  });

  it('propaga ValidationError para nome curto, e não persiste', async () => {
    await expect(
      sut.executar({ nome: 'AB', preco: 100, quantidade: 1 }),
    ).rejects.toThrow(ValidationError);

    expect(repo.items).toHaveLength(0);
  });

  it('propaga ValidationError para preço negativo, e não persiste', async () => {
    await expect(
      sut.executar({ nome: 'Produto', preco: -10, quantidade: 1 }),
    ).rejects.toThrow(ValidationError);

    expect(repo.items).toHaveLength(0);
  });

  it('propaga ValidationError para quantidade decimal', async () => {
    await expect(
      sut.executar({ nome: 'Produto', preco: 10, quantidade: 1.5 }),
    ).rejects.toThrow(ValidationError);
  });
});