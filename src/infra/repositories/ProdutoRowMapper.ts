import { Produto } from '../../domain/entities/Produto.js';
import { Preco } from '../../domain/value-objects/Preco.js';
import { Quantidade } from '../../domain/value-objects/Quantidade.js';

//concentra em um unico lugar a conversao de como o dado sai do pg e de como ele vai ser recebido pela entity
export interface ProdutoRow {
  id: string;
  nome: string;
  preco: string;          //NUMERIC chega como STRING no driver pg!
  quantidade: number;
  criado_em: Date;
  atualizado_em: Date;
}

export class ProdutoRowMapper {
  //pg para entity
  static paraEntity(row: ProdutoRow): Produto {
    return Produto.reconstituir({
      id: row.id,
      nome: row.nome,
      preco: Preco.criar(Number(row.preco)),
      quantidade: Quantidade.criar(row.quantidade),
      criadoEm: row.criado_em,
      atualizadoEm: row.atualizado_em,
    });
  }
  //entity para pg
  static paraColunas(p: Produto) {
    return {
      id: p.id,
      nome: p.nome,
      preco: p.preco.valor,
      quantidade: p.quantidade.valor,
      criado_em: p.criadoEm,
      atualizado_em: p.atualizadoEm,
    };
  }
}