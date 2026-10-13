import type { ProdutoDTO } from './ProdutoDTO.js';

export interface ListarProdutosInputDTO {
  pagina?: number;
  limite?: number;
  nome?: string; 
  apenasDisponiveis?: boolean;
}

export interface ListarProdutosOutputDTO {
  itens: ProdutoDTO[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}