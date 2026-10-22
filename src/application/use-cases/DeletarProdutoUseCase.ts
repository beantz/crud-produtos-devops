import type { ProdutoRepository } from '../interfaces/ProdutoRepository.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import type { DeletarProdutoInputDTO } from '../dtos/DeletarProdutoDTO.js';

export class DeletarProdutoUseCase {
  constructor(private readonly repo: ProdutoRepository) {}

  async executar(input: DeletarProdutoInputDTO): Promise<void> {
    const produto = await this.repo.buscarPorId(input.id);
    if (!produto) throw new NotFoundError('Produto', input.id);
    await this.repo.deletar(input.id);
  }
}
