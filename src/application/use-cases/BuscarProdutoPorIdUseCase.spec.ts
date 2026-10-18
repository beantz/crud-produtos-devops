import { describe, it, expect, beforeEach } from 'vitest';
import { BuscarProdutoPorIdUseCase } from './BuscarProdutoPorIdUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';

describe('BuscarProdutoPorIdUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: BuscarProdutoPorIdUseCase;

  beforeEach(() => {
    repo = new InMemoryProdutoRepository();
    sut = new BuscarProdutoPorIdUseCase(repo);
  });

  it('retorna o DTO quando o produto existe', async () => {
    await repo.adicionar(makeProduto({ id: 'abc', nome: 'Xbox', preco: 4500, quantidade: 3 }));

    const output = await sut.executar({ id: 'abc' });

    expect(output).toMatchObject({
      id: 'abc',
      nome: 'Xbox',
      preco: 4500,
      quantidade: 3,
      disponivel: true,
    });
  });

  it('devolve datas em formato ISO 8601 (string, não Date)', async () => {
    await repo.adicionar(makeProduto({ id: 'abc' }));

    const output = await sut.executar({ id: 'abc' });

    expect(typeof output.criadoEm).toBe('string');
    expect(new Date(output.criadoEm).toISOString()).toBe(output.criadoEm);
  });

  it('lança NotFoundError quando não existe', async () => {
    await expect(sut.executar({ id: 'inexistente' })).rejects.toThrow(NotFoundError);
  });

  it('inclui o id procurado na mensagem de erro', async () => {
    await expect(sut.executar({ id: 'abc-123' })).rejects.toThrow('abc-123');
  });

  it('não encontra produto de outro id', async () => {
    await repo.adicionar(makeProduto({ id: 'outro' }));

    await expect(sut.executar({ id: 'abc' })).rejects.toThrow(NotFoundError);
  });
});