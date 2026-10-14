import { Produto } from '../../domain/entities/Produto.js';

export interface OpcoesListagem {
  limite?: number;
  deslocamento?: number;
}

interface FiltroListagem {
  nome?: string | undefined;
  apenasDisponiveis?: boolean | undefined;
  limite: number;
  deslocamento: number;
}

export interface ResultadoListagem {
  itens: Produto[];
  total: number;
}

export interface ProdutoRepository {
  adicionar(produto: Produto): Promise<void>;
  atualizar(produto: Produto): Promise<void>;
  deletar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Produto | null>;
  listar(opcoes?: OpcoesListagem): Promise<Produto[]>;
  buscarPaginado(filtro: FiltroListagem): Promise<ResultadoListagem>;
  buscarPorNomeContendo(trecho: string): Promise<Produto[]>;
  existeComNome(nome: string, ignorarId?: string): Promise<boolean>;
}