import type { Pool } from 'pg';
import { PostgresProdutoRepository } from '../repositories/PostgresProdutoRepository.js';
import type { ProdutoRepository } from '../../application/interfaces/ProdutoRepository.js';
import type { UnitOfWork } from '../../application/interfaces/UnitOfWork.js';

export interface Repositorios {
  produtos: ProdutoRepository;
}

export class PostgresUnitOfWork implements UnitOfWork {
  constructor(private readonly pool: Pool) {}

  async executar<T>(trabalho: (repos: Repositorios) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN'); //iniciar transacao
      const resultado = await trabalho({
        produtos: new PostgresProdutoRepository(client), //mesma conexão em tudo, todas as queries que o repositório fizer
      });                                                // durante esse trabalho usarão a mesma transação.
      await client.query('COMMIT'); //salva no banco de forma definida
      return resultado;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}