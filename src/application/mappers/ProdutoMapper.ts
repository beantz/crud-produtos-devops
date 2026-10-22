import { Produto } from '../../domain/entities/Produto.js';
import type { ProdutoDTO } from '../dtos/ProdutoDTO.js';

export class ProdutoMapper {
  static paraDTO(produto: Produto): ProdutoDTO {
    return {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco.valor,
      quantidade: produto.quantidade.valor,
      disponivel: produto.estaDisponivel(),
      criadoEm: produto.criadoEm.toISOString(),
      atualizadoEm: produto.atualizadoEm.toISOString(),
    };
  }

  static paraDTOs(produtos: Produto[]): ProdutoDTO[] {
    return produtos.map(ProdutoMapper.paraDTO);
  }
}
