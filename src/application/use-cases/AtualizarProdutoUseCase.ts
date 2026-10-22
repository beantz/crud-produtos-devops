import type { ProdutoRepository } from '../interfaces/ProdutoRepository.js';
import type { AtualizarProdutoInputDTO } from '../dtos/AtualizarProdutoDTO.js';
import type { AtualizarProdutoOutputDTO } from '../dtos/AtualizarProdutoDTO.js';
import { ProdutoMapper } from '../mappers/ProdutoMapper.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';

export class AtualizarProdutoUseCase {
  constructor(private readonly repo: ProdutoRepository) {}

  async executar(input: AtualizarProdutoInputDTO): Promise<AtualizarProdutoOutputDTO> {
    const produto = await this.repo.buscarPorId(input.id);
    if (!produto) throw new NotFoundError('produto', input.id);

    if (input.nome !== undefined) {
      if (await this.repo.existeComNome(input.nome, produto.id)) {
        throw new DuplicateProductError(`nome "${input.nome}"`);
      }
      produto.renomear(input.nome);
    }
    if (input.preco !== undefined) {
      produto.alterarPreco(input.preco);
    }

    await this.repo.atualizar(produto);
    return ProdutoMapper.paraDTO(produto);
  }
}
