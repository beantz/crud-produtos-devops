import { describe, it, expect, beforeEach } from 'vitest';
import { DeletarProdutoUseCase } from './DeletarProdutoUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';

describe('DeletarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: DeletarProdutoUseCase;

  beforeEach(async () => {
    repo = new InMemoryProdutoRepository();
    sut = new DeletarProdutoUseCase(repo);
    await repo.adicionar(makeProduto({ id: 'id-1', nome: 'Produto 1' }));
    await repo.adicionar(makeProduto({ id: 'id-2', nome: 'Produto 2' }));
  });

  it('remove o produto', async () => {
    await sut.executar({ id: 'id-1' });

    expect(await repo.buscarPorId('id-1')).toBeNull();
  });

  it('não remove os outros produtos', async () => {
    await sut.executar({ id: 'id-1' });

    expect(repo.items.map((p) => p.id)).toEqual(['id-2']);
  });

  it('lança NotFoundError quando o produto não existe', async () => {
    await expect(sut.executar({ id: 'inexistente' })).rejects.toThrow(NotFoundError);
  });

  it('não remove nada quando o produto não existe', async () => {
    await expect(sut.executar({ id: 'inexistente' })).rejects.toThrow(NotFoundError);

    expect(repo.items).toHaveLength(2);
  });

  it('deletar duas vezes lança NotFoundError na segunda', async () => {
    await sut.executar({ id: 'id-1' });

    await expect(sut.executar({ id: 'id-1' })).rejects.toThrow(NotFoundError);
  });
});