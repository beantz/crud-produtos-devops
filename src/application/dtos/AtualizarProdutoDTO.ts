import type { ProdutoDTO } from './ProdutoDTO.js';

export interface AtualizarProdutoInputDTO {
  id: string;
  nome?: string;
  preco?: number;
}

//"AtualizarProdutoOutputDTO" é outro nome para "ProdutoDTO".
export type AtualizarProdutoOutputDTO = ProdutoDTO;
