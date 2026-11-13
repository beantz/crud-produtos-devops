import { Produto } from '../../domain/entities/Produto.js';
import { Preco } from '../../domain/value-objects/Preco.js';
import { Quantidade } from '../../domain/value-objects/Quantidade.js';

interface ProdutoCache {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  criadoEm: string;
  atualizadoEm: string;
}

export const ProdutoCacheMapper = {
  serializar(p: Produto): ProdutoCache {
    return {
      id: p.id,
      nome: p.nome,
      preco: p.preco.valor,
      quantidade: p.quantidade.valor,
      criadoEm: p.criadoEm.toISOString(),
      atualizadoEm: p.atualizadoEm.toISOString(),
    };
  },

  reconstituir(c: ProdutoCache): Produto {
    return Produto.reconstituir({
      id: c.id,
      nome: c.nome,
      preco: Preco.criar(c.preco),
      quantidade: Quantidade.criar(c.quantidade),
      criadoEm: new Date(c.criadoEm),
      atualizadoEm: new Date(c.atualizadoEm),
    });
  },
};

export type { ProdutoCache };