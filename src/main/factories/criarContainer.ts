import type { ProdutoRepository } from '../../application/interfaces/ProdutoRepository.js';
import type { IdGenerator } from '../../application/interfaces/IdGenerator.js';
import { CriarProdutoUseCase } from '../../application/use-cases/CriarProdutoUseCase.js';
import { BuscarProdutoPorIdUseCase } from '../../application/use-cases/BuscarProdutoPorIdUseCase.js';
import { ListarProdutosUseCase } from '../../application/use-cases/ListarProdutosUseCase.js';
import { AtualizarProdutoUseCase } from '../../application/use-cases/AtualizarProdutoUseCase.js';
import { AjustarEstoqueUseCase } from '../../application/use-cases/AjustarEstoqueUseCase.js';
import { DeletarProdutoUseCase } from '../../application/use-cases/DeletarProdutoUseCase.js';
import { ProdutoController } from '../../infra/http/controllers/ProdutoController.js';

/*recebe as dependências de INFRA já escolhidas e monta o resto*/
export function criarProdutoController(repo: ProdutoRepository, ids: IdGenerator): ProdutoController {
  return new ProdutoController({
    criar: new CriarProdutoUseCase(repo, ids),
    buscar: new BuscarProdutoPorIdUseCase(repo),
    listar: new ListarProdutosUseCase(repo),
    atualizar: new AtualizarProdutoUseCase(repo),
    ajustarEstoque: new AjustarEstoqueUseCase(repo),
    deletar: new DeletarProdutoUseCase(repo),
  });
}