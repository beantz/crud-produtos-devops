import { Produto } from '../../domain/entities/Produto.js';

export interface FiltroListagem {
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
  buscarPaginado(filtro: FiltroListagem): Promise<ResultadoListagem>;
  existeComNome(nome: string, ignorarId?: string): Promise<boolean>;
}
