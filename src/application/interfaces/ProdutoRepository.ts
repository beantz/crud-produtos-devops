import { Produto } from '../../domain/entities/Produto.js';

export interface OpcoesListagem {
  limite?: number;
  deslocamento?: number;
}

export interface ProdutoRepository {
  adicionar(produto: Produto): Promise<void>;
  atualizar(produto: Produto): Promise<void>;
  deletar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Produto | null>;
  listar(opcoes?: OpcoesListagem): Promise<Produto[]>;
  buscarPorNomeContendo(trecho: string): Promise<Produto[]>;
  existeComNome(nome: string, ignorarId?: string): Promise<boolean>;
}