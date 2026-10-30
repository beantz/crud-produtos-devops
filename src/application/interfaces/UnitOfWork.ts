import type { ProdutoRepository } from './ProdutoRepository.js';

export interface UnitOfWork {
  //<T> significa que ele retorna a mesma Promise do que a sua função de trabalho retornar
  //recebe um obj com os repo disponiveis
  executar<T>(trabalho: (repos: { produtos: ProdutoRepository }) => Promise<T>): Promise<T>;
}