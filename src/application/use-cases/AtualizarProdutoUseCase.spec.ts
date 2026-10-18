import { describe, it, expect, beforeEach } from 'vitest';
import { AtualizarProdutoUseCase } from './AtualizarProdutoUseCase.js';
import { InMemoryProdutoRepository } from '../../shared/testing/InMemoryProdutoRepository.js';
import { makeProduto } from '../../shared/testing/makeProduto.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { ValidationError } from '../../domain/errors/ValidationError.js';

describe('AtualizarProdutoUseCase', () => {
  let repo: InMemoryProdutoRepository;
  let sut: AtualizarProdutoUseCase;

  beforeEach(async () => {
    repo = new InMemoryProdutoRepository();
    sut = new AtualizarProdutoUseCase(repo);
    await repo.adicionar(
      makeProduto({ id: 'id-1', nome: 'Xbox', preco: 4500, quantidade: 10 }),
    );
  });

  it('atualiza o nome', async () => {
    const output = await sut.executar({ id: 'id-1', nome: 'Xbox Series X' });

    expect(output.nome).toBe('Xbox Series X');
  });

  it('atualiza o preço', async () => {
    const output = await sut.executar({ id: 'id-1', preco: 5000 });

    expect(output.preco).toBe(5000);
  });

  it('atualiza nome e preço juntos', async () => {
    const output = await sut.executar({ id: 'id-1', nome: 'Novo Nome', preco: 999 });
    //*ele passa se o objeto recebido contiver todas as propriedades e valores especificados — ignorando o resto.
    expect(output).toMatchObject({ nome: 'Novo Nome', preco: 999 });
  });

  it('PERSISTE a alteração (relê do repositório)', async () => {
    await sut.executar({ id: 'id-1', preco: 5000 });

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.preco.valor).toBe(5000);
  });

  it('preserva os campos não enviados (PATCH)', async () => {
    const output = await sut.executar({ id: 'id-1', preco: 5000 });

    expect(output.nome).toBe('Xbox');
    expect(output.quantidade).toBe(10);
  });

  it('aceita preço zero (0 não é tratado como "ausente")', async () => {
    const output = await sut.executar({ id: 'id-1', preco: 0 });

    expect(output.preco).toBe(0);
  });

  it('não altera nada quando o input só tem id', async () => {
    const output = await sut.executar({ id: 'id-1' });

    expect(output).toMatchObject({ nome: 'Xbox', preco: 4500 });
  });

  it('lança NotFoundError quando o produto não existe', async () => {
    await expect(
      sut.executar({ id: 'inexistente', nome: 'Qualquer' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('lança DuplicateProductError quando o nome pertence a outro produto', async () => {
    await repo.adicionar(makeProduto({ id: 'id-2', nome: 'PS5' }));

    await expect(sut.executar({ id: 'id-1', nome: 'PS5' }))
      .rejects.toThrow(DuplicateProductError);
  });

  it('não acusa duplicidade quando o nome é do próprio produto', async () => {
    const output = await sut.executar({ id: 'id-1', nome: 'XBOX' });

    expect(output.nome).toBe('XBOX');
  });

  it('propaga ValidationError para nome inválido e NÃO salva', async () => {
    await expect(sut.executar({ id: 'id-1', nome: 'ab' }))
      .rejects.toThrow(ValidationError);

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.nome).toBe('Xbox');
  });

  it('propaga ValidationError para preço negativo e NÃO salva', async () => {
    await expect(sut.executar({ id: 'id-1', preco: -1 }))
      .rejects.toThrow(ValidationError);

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.preco.valor).toBe(4500);
  });

  it('não salva mudança parcial quando o segundo campo é inválido', async () => {
    await expect(sut.executar({ id: 'id-1', nome: 'Nome Válido', preco: -1 }))
      .rejects.toThrow(ValidationError);

    const salvo = await repo.buscarPorId('id-1');
    expect(salvo?.nome).toBe('Xbox'); 
  });
});