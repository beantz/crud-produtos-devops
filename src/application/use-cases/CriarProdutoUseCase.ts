import { Produto } from '../../domain/entities/Produto.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import type { ProdutoRepository } from '../interfaces/ProdutoRepository.js';
import type  { IdGenerator } from '../interfaces/IdGenerator.js';
import type { CriarProdutoInputDTO } from  '../dtos/CriarProdutoDTO.js';
import type { CriarProdutoOutputDTO } from  '../dtos/CriarProdutoDTO.js';
import { ProdutoMapper } from  '../mappers/ProdutoMapper.js';

export class CriarProdutoUseCase {
  constructor(
    private readonly repo: ProdutoRepository,
    private readonly ids: IdGenerator,
  ) {}

  async executar(input: CriarProdutoInputDTO): Promise<CriarProdutoOutputDTO> {
    if (await this.repo.existeComNome(input.nome)) {
      throw new DuplicateProductError(`nome "${input.nome}"`);
    }

    const produto = Produto.criar({ id: this.ids.gerar(), ...input });
    await this.repo.adicionar(produto);
    return ProdutoMapper.paraDTO(produto);
  }
}