import type { ProdutoRepository, FiltroListagem, ResultadoListagem } from '../../application/interfaces/ProdutoRepository.js';
import { DuplicateProductError } from '../../domain/errors/DuplicateProductError.js';
import { NotFoundError } from "../../domain/errors/NotFoundError.js";
import { Produto } from '../../domain/entities/Produto.js';

export class InMemoryProdutoRepository implements ProdutoRepository {
  //id -> string ,Produto -> valor
  private readonly store = new Map<string, Produto>();

  //apenas para asserts nos testes, devolve cópias.
  get items(): Produto[] {
    return [...this.store.values()].map(clonar);
  }

  async adicionar(produto: Produto): Promise<void> {
    if (this.store.has(produto.id)) {
      throw new DuplicateProductError(produto.id);
    }
    this.store.set(produto.id, clonar(produto));
  }

  async atualizar(produto: Produto): Promise<void> {
    if (!this.store.has(produto.id)) {
      throw new NotFoundError(produto.nome, produto.id);
    }
    this.store.set(produto.id, clonar(produto));
  }

  async deletar(id: string): Promise<void> {
    this.store.delete(id);
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const encontrado = this.store.get(id);
    //se achou devolve a copia, se nao manda o null
    return encontrado ? clonar(encontrado) : null;
  }

  async buscarPaginado(f: FiltroListagem): Promise<ResultadoListagem> {
    let lista = this.items;

    if (f.nome) {
      const alvo = normalizar(f.nome);
      lista = lista.filter((p) => normalizar(p.nome).includes(alvo));
    }
    if (f.apenasDisponiveis) {
      lista = lista.filter((p) => p.estaDisponivel());
    }

    return {
      total: lista.length,
      //qual indice comeca, pega o indice mais o limite de quantos vai exibir
      itens: lista.slice(f.deslocamento, f.deslocamento + f.limite),
    };
  }

  async existeComNome(nome: string, ignorarId?: string): Promise<boolean> {
    const alvo = normalizar(nome);
    //some testa algo no array satisfaz uma condicao
    return [...this.store.values()].some(
      (p) => p.id !== ignorarId && normalizar(p.nome) === alvo,
    );
  }
}

//helpers
function normalizar(texto: string): string {
  return texto.trim().toLowerCase();
}

/**simula o que um banco real faz: o que sai é sempre uma "cópia nova"*/
function clonar(produto: Produto): Produto {
  return Produto.reconstituir({
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,           //vo imutável: pode compartilhar
    quantidade: produto.quantidade, 
    criadoEm: produto.criadoEm,
    atualizadoEm: produto.atualizadoEm,
  });
}