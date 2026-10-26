import type { Pool, PoolClient } from 'pg';
import type { ProdutoRepository, OpcoesListagem, FiltroListagem, ResultadoListagem,
} from '../../application/interfaces/ProdutoRepository.js';
import { Produto } from '../../domain/entities/Produto.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import { ProdutoRowMapper, type ProdutoRow } from './ProdutoRowMapper.js';

export type Queryable = Pick<Pool | PoolClient, 'query'>;

const COLUNAS = 'id, nome, preco, quantidade, criado_em, atualizado_em';
const UNIQUE_VIOLATION = '23505';

export class PostgresProdutoRepository implements ProdutoRepository {
  constructor(private readonly db: Queryable) {}

  async adicionar(produto: Produto): Promise<void> {
    const c = ProdutoRowMapper.paraColunas(produto);
    try {
      await this.db.query(
        `INSERT INTO produtos (${COLUNAS}) VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.id, c.nome, c.preco, c.quantidade, c.criado_em, c.atualizado_em],
      );
    } catch (e) {
      throw this.traduzirErro(e, produto);
    }
  }

  async atualizar(produto: Produto): Promise<void> {
    const c = ProdutoRowMapper.paraColunas(produto);
    try {
      const r = await this.db.query(
        `UPDATE produtos
            SET nome = $2, preco = $3, quantidade = $4, atualizado_em = $5
          WHERE id = $1`,
        [c.id, c.nome, c.preco, c.quantidade, c.atualizado_em],
      );
      /*nenhuma linha alterada -> produto nao existe*/
      if (r.rowCount === 0) throw new NotFoundError('Produto', produto.id);
    } catch (e) {
      throw this.traduzirErro(e, produto);
    }
  }

  async deletar(id: string): Promise<void> {
    await this.db.query('DELETE FROM produtos WHERE id = $1', [id]); // idempotente
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const r = await this.db.query<ProdutoRow>(
      `SELECT ${COLUNAS} FROM produtos WHERE id = $1`,
      [id],
    );
    // se achou retorna de pg para entity com vo
    return r.rows[0] ? ProdutoRowMapper.paraEntity(r.rows[0]) : null;
  }

  async listar({ limite, deslocamento = 0 }: OpcoesListagem = {}): Promise<Produto[]> {
    const r = await this.db.query<ProdutoRow>(
      `SELECT ${COLUNAS} FROM produtos
        ORDER BY criado_em, id
        LIMIT $1 OFFSET $2`,
      [limite ?? null, deslocamento], // LIMIT NULL = sem limite no Postgres
    );
    return r.rows.map(ProdutoRowMapper.paraEntity);
  }

  async buscarPaginado(f: FiltroListagem): Promise<ResultadoListagem> {
    const condicoes: string[] = [];
    const params: unknown[] = [];

    if (f.nome) {
      params.push(`%${escaparLike(f.nome.trim())}%`);
      condicoes.push(`nome ILIKE $${params.length}`);
    }
    if (f.apenasDisponiveis) {
      condicoes.push('quantidade > 0');
    }
    //join serve pra pegar todos os elementos de um array e por em uma string adicionando o and bem no meio da string
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    //verifica quantos produtos com as condicoes existem sem retornar nenhum deles
    const total = await this.db.query<{ total: string }>(
      //count conta quantas linhas passam pelo where
      `SELECT COUNT(*) AS total FROM produtos ${where}`,
      params,
    );

    //limit + 1 e offset + 2, significa q eles precisam usar os proximos numeros disponiveis apos ja usados pelo where
    const itens = await this.db.query<ProdutoRow>(
      `SELECT ${COLUNAS} FROM produtos ${where}
        ORDER BY criado_em, id
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, f.limite, f.deslocamento],
    );

    return {
      total: Number(total.rows[0].total), //COUNT(*) também chega como string (bigint)
      itens: itens.rows.map(ProdutoRowMapper.paraEntity),
    };
  }

  async buscarPorNomeContendo(trecho: string): Promise<Produto[]> {
    const r = await this.db.query<ProdutoRow>(
      `SELECT ${COLUNAS} FROM produtos WHERE nome ILIKE $1 ORDER BY criado_em, id`,
      [`%${escaparLike(trecho.trim())}%`],
      //escaparLike remove -> % e _ que possam a vir junto na string
    );
    //map->aplica uma determinada condicao a todos os elementos do array
    return r.rows.map(ProdutoRowMapper.paraEntity);
  }

  async existeComNome(nome: string, ignorarId?: string): Promise<boolean> {
    const r = await this.db.query(
      `SELECT 1 FROM produtos
        WHERE LOWER(TRIM(nome)) = LOWER(TRIM($1))
          AND ($2::varchar IS NULL OR id <> $2)
        LIMIT 1`,
      [nome, ignorarId ?? null],
    );
    //varchar retorna o tipo, <> sinal de diferenca, Limit 1 apenas verifica a existencia, varchar trata como texto o $2
    return r.rowCount! > 0;
  }

  //aplication nao pode conhecer erros e nem codigo, infra que traduz
  private traduzirErro(e: unknown, produto: Produto): unknown {
    const err = e as { code?: string; constraint?: string };
    if (err.code === UNIQUE_VIOLATION) {
      return new DuplicateProductError(
        err.constraint === 'produtos_pkey' ? produto.id : produto.nome,
      );
    }
    return e;
  }
}

function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}