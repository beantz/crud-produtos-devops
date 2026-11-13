import type { ProdutoRepository, OpcoesListagem, FiltroListagem, ResultadoListagem} from '../../application/interfaces/ProdutoRepository.js';
import type { CacheStore } from '../../application/interfaces/CacheStore.js';
import type { Produto } from '../../domain/entities/Produto.js';
import { ProdutoCacheMapper, type ProdutoCache } from './ProdutoCacheMapper.js';

const CHAVE_VERSAO = 'produtos:lista:versao';
const chaveProduto = (id: string) => `produto:${id}`;

export interface OpcoesCache {
  ttlProdutoSegundos?: number;
  ttlListaSegundos?: number;
}

export class CachedProdutoRepository implements ProdutoRepository {
  private readonly ttlProduto: number;
  private readonly ttlLista: number;

  constructor(
    private readonly origem: ProdutoRepository,
    private readonly cache: CacheStore,
    opcoes: OpcoesCache = {},
  ) {
    this.ttlProduto = opcoes.ttlProdutoSegundos ?? 60;
    this.ttlLista = opcoes.ttlListaSegundos ?? 30; //listas mudam mais, TTL menor
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const chave = chaveProduto(id);

    const emCache = await this.cache.obter(chave);
    if (emCache !== null) {
      return ProdutoCacheMapper.reconstituir(JSON.parse(emCache) as ProdutoCache); //HIT deu certo cache
    }

    const produto = await this.origem.buscarPorId(id); //MISS erro, buscar no banco
    if (produto) {
      await this.cache.guardar(chave, JSON.stringify(ProdutoCacheMapper.serializar(produto)), this.ttlProduto);
    }
    return produto; 
  }

  async buscarPaginado(f: FiltroListagem): Promise<ResultadoListagem> {
    const versao = await this.versaoDaLista();
    //uma lista em texto de oq buscar no cache
    //versao se refere a versao da lista conforme atualiza os dados novos inseridos
    const chave = `produtos:lista:v${versao}:${JSON.stringify([f.nome ?? '', f.apenasDisponiveis ?? false, f.limite, f.deslocamento])}`;

    const emCache = await this.cache.obter(chave);
    if (emCache !== null) {
      const dados = JSON.parse(emCache) as { total: number; itens: ProdutoCache[] };
      return { total: dados.total, itens: dados.itens.map(ProdutoCacheMapper.reconstituir) };
    }

    const resultado = await this.origem.buscarPaginado(f);
    await this.cache.guardar(
      chave,
      JSON.stringify({ total: resultado.total, itens: resultado.itens.map(ProdutoCacheMapper.serializar) }),
      this.ttlLista,
    );
    return resultado;
  }

  async adicionar(produto: Produto): Promise<void> {
    await this.origem.adicionar(produto);
    await this.invalidarLista();
  }

  async atualizar(produto: Produto): Promise<void> {
    await this.origem.atualizar(produto);
    await this.cache.remover(chaveProduto(produto.id));
    await this.invalidarLista();
  }

  async deletar(id: string): Promise<void> {
    await this.origem.deletar(id);
    await this.cache.remover(chaveProduto(id));
    await this.invalidarLista();
  }

  buscarPorNomeContendo(trecho: string): Promise<Produto[]> {
    return this.origem.buscarPorNomeContendo(trecho);
  }

  existeComNome(nome: string, ignorarId?: string): Promise<boolean> {
    return this.origem.existeComNome(nome, ignorarId);
  }

  private async versaoDaLista(): Promise<string> {
    return (await this.cache.obter(CHAVE_VERSAO)) ?? '0';
  }

  /*muda a versão torna TODAS as chaves de listagem antigas inalcançáveis*/
  private async invalidarLista(): Promise<void> {
    await this.cache.incrementar(CHAVE_VERSAO);
  }
}