import type { ProdutoRepository } from '../interfaces/ProdutoRepository.js';
import { ProdutoMapper } from  '../mappers/ProdutoMapper.js';
import type { ListarProdutosInputDTO } from  '../dtos/ListarProdutosDTO.js';
import type { ListarProdutosOutputDTO } from  '../dtos/ListarProdutosDTO.js';

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 100;

export class ListarProdutosUseCase {
  constructor(private readonly repo: ProdutoRepository) {}

  async executar(input: ListarProdutosInputDTO = {}): Promise<ListarProdutosOutputDTO> {
    const pagina = Math.max(1, Math.floor(input.pagina ?? 1));
    const limite = Math.min(LIMITE_MAXIMO, Math.max(1, Math.floor(input.limite ?? LIMITE_PADRAO)));

    const { itens, total } = await this.repo.buscarPaginado({
      nome: input.nome,
      apenasDisponiveis: input.apenasDisponiveis,
      limite,
      deslocamento: (pagina - 1) * limite,
    });

    return {
      itens: ProdutoMapper.paraDTOs(itens),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}