import { Produto } from '../../domain/entities/Produto.js';
//*partials->torna todas as propriedades opcionais
type Overrides = Partial<{ id: string; nome: string; preco: number; quantidade: number }>;

export function makeProduto(overrides: Overrides = {}): Produto {
  return Produto.criar({
    id: 'id-1',
    nome: 'Xbox Series X',
    preco: 4500,
    quantidade: 10,
    ...overrides, //*sobrescreve os que nao foram atualizados
  });
}
