import type { ProdutoDTO } from './ProdutoDTO.js';

export interface BuscarProdutoPorIdInputDTO {
  id: string;
}

export type BuscarProdutoPorIdOutputDTO = ProdutoDTO;
