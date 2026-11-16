// scripts/seed.ts
import { criarPool } from '../src/infra/database/pool.js';
import { PostgresProdutoRepository } from '../src/infra/repositories/PostgresProdutoRepository.js';
import { Produto } from '../src/domain/entities/Produto.js';

async function main() {
  const pool = criarPool();
  const repo = new PostgresProdutoRepository(pool);

  console.log('Limpando o banco...');
  await pool.query('TRUNCATE TABLE produtos CASCADE');

  console.log('Inserindo produtos...');
  for (let i = 1; i <= 50; i++) {
    // Adapte a criação de acordo com a assinatura da sua entidade Produto
    const p = Produto.criar({
      id: crypto.randomUUID(),
      nome: `Produto Teste ${i}`,
      preco: 100 + i,
      quantidade: 100,
    });
    await repo.adicionar(p);
  }

  console.log('Seed concluído com sucesso!');
  await pool.end();
}

main();