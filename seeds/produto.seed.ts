import { criarPool } from '../src/infra/database/pool';
import { PostgresProdutoRepository } from '../src/infra/repositories/PostgresProdutoRepository';
import { Produto } from '../src/domain/entities/Produto';

const dados = [
  { id: 'seed-1', nome: 'Notebook Gamer', preco: 7500, quantidade: 5 },
  { id: 'seed-2', nome: 'Mouse Sem Fio', preco: 129.9, quantidade: 40 },
  { id: 'seed-3', nome: 'Teclado Mecânico', preco: 399.9, quantidade: 0 },
  { id: 'seed-4', nome: 'Monitor 27 polegadas', preco: 1899, quantidade: 12 },
];

const pool = criarPool();

async function main() {
  const repo = new PostgresProdutoRepository(pool);

  for (const d of dados) {
    if (await repo.buscarPorId(d.id)) continue; //idempotente: pode rodar várias vezes, pula um dado e tenta outro
    await repo.adicionar(Produto.criar(d));
  }

  console.log(`Seed concluído (${dados.length} produtos).`);
}
//executa a main e se der erro o ccath resgata
main()
  .catch((e) => { console.error(e), process.exit(1)}) //encerra o codigo com saida 1
  .finally(() => pool.end());
;

