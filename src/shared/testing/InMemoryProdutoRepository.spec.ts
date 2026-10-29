import { testarContratoProdutoRepository } from '../../infra/repositories/produtoRepositoryContract.js';
import { InMemoryProdutoRepository } from './InMemoryProdutoRepository.js';

//passa o nome do q vai testar e uma factory pra passar uma instancia dos teste
testarContratoProdutoRepository('InMemory', async () => new InMemoryProdutoRepository());