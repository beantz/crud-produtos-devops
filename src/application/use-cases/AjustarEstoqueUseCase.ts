import type { ProdutoRepository } from  '../interfaces/ProdutoRepository.js';
import type { AjustarEstoqueInputDTO } from  '../dtos/AjustarEstoqueDTO.js';
import type { AjustarEstoqueOutputDTO } from  '../dtos/AjustarEstoqueDTO.js';
import { ProdutoMapper } from  '../mappers/ProdutoMapper.js';
import { NotFoundError } from  '../../domain/errors/NotFoundError.js';

export class AjustarEstoqueUseCase {
  constructor(private readonly repo: ProdutoRepository) {}

  async executar(input: AjustarEstoqueInputDTO): Promise<AjustarEstoqueOutputDTO> {
    const produto = await this.repo.buscarPorId(input.id);
    if (!produto) throw new NotFoundError('produto', input.id);

    if (input.tipo === 'adicionar') produto.adicionarEstoque(input.quantidade);
    else produto.removerEstoque(input.quantidade);

    await this.repo.atualizar(produto);
    return ProdutoMapper.paraDTO(produto);
  }
}