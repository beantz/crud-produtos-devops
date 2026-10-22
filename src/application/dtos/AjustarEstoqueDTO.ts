import type { ProdutoDTO } from './ProdutoDTO.js';

export interface AjustarEstoqueInputDTO {
  id: string;
  tipo: 'adicionar' | 'remover';
  quantidade: number;
}

export type AjustarEstoqueOutputDTO = ProdutoDTO;
