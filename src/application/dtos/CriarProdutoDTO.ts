import type { ProdutoDTO } from './ProdutoDTO.js';

export interface CriarProdutoInputDTO {
  nome: string;
  preco: number;
  quantidade: number;
}

export type CriarProdutoOutputDTO = ProdutoDTO;