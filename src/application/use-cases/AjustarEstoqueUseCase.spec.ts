import { describe, it, expect, beforeEach } from 'vitest';
import { AjustarEstoqueUseCase } from './AjustarEstoqueUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import { ValidationError } from '../../domain/errors/ValidationError.js';

describe('AjustarEstoqueUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: AjustarEstoqueUseCase;

  //*roda antes de cada it, permite que cada teste rode do zero
  beforeEach(async () => {
    repo = new InMemoryProdutoRepository();
    sut = new AjustarEstoqueUseCase(repo);
    await repo.adicionar(makeProduto({ id: 'id-1', quantidade: 10 }));
  });

  it('adiciona estoque', async () => {
    const output = await sut.executar({ id: 'id-1', tipo: 'adicionar', quantidade: 5 });

    expect(output.quantidade).toBe(15);
  });

  it('remove estoque', async () => {
    const output = await sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 3 });

    expect(output.quantidade).toBe(7);
  });

  it('PERSISTE o novo estoque (relê do repositório)', async () => {
    await sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 3 });

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.quantidade.valor).toBe(7);
  });

  it('acumula operações sucessivas', async () => {
    await sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 4 });
    const output = await sut.executar({ id: 'id-1', tipo: 'adicionar', quantidade: 1 });

    expect(output.quantidade).toBe(7);
  });

  it('permite zerar o estoque e marca como indisponível', async () => {
    const output = await sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 10 });

    expect(output.quantidade).toBe(0);
    expect(output.disponivel).toBe(false);
  });

  it('volta a ficar disponível ao repor estoque', async () => {
    await sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 10 });
    const output = await sut.executar({ id: 'id-1', tipo: 'adicionar', quantidade: 1 });

    expect(output.disponivel).toBe(true);
  });

  it('rejeita remover mais que o disponível e NÃO altera o estoque', async () => {
    await expect(
      sut.executar({ id: 'id-1', tipo: 'remover', quantidade: 100 }),
    ).rejects.toThrow(ValidationError);

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.quantidade.valor).toBe(10);
  });

  it('rejeita quantidade negativa', async () => {
    await expect(
      sut.executar({ id: 'id-1', tipo: 'adicionar', quantidade: -1 }),
    ).rejects.toThrow(ValidationError);
  });

  it('rejeita quantidade decimal', async () => {
    await expect(
      sut.executar({ id: 'id-1', tipo: 'adicionar', quantidade: 1.5 }),
    ).rejects.toThrow(ValidationError);
  });

  it('lança NotFoundError quando o produto não existe', async () => {
    await expect(
      sut.executar({ id: 'inexistente', tipo: 'adicionar', quantidade: 5 }),
    ).rejects.toThrow(NotFoundError);
  });
});