import type { ProdutoRepository } from  '../interfaces/ProdutoRepository.js';
import type { BuscarProdutoPorIdInputDTO } from  '../dtos/BuscarProdutoPorIdDTO.js';
import type { BuscarProdutoPorIdOutputDTO } from  '../dtos/BuscarProdutoPorIdDTO.js';
import { ProdutoMapper } from  '../mappers/ProdutoMapper.js';
import { NotFoundError } from  '../../domain/errors/NotFoundError.js';

export class BuscarProdutoPorIdUseCase {
  constructor(private readonly repo: ProdutoRepository) {}

  async executar(input: BuscarProdutoPorIdInputDTO): Promise<BuscarProdutoPorIdOutputDTO> {
    const produto = await this.repo.buscarPorId(input.id);
    if (!produto) throw new NotFoundError('Produto', input.id);
    return ProdutoMapper.paraDTO(produto);
  }
}