import { Preco } from '../value-objects/Preco.js';
import { Quantidade } from '../value-objects/Quantidade.js';
import { ValidationError } from "../errors/ValidationError.js";

//como o produto e por dentro
interface ProdutoProps {
  id: string;
  nome: string;
  preco: Preco;
  quantidade: Quantidade;
  criadoEm: Date;
  atualizadoEm: Date;
}

//o que e me dado para criar um novo
interface CriarProdutoParams {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

const NOME_MIN = 3;
const NOME_MAX = 200;

export class Produto {
  private readonly _id: string;
  private _nome: string;
  private _preco: Preco;
  private _quantidade: Quantidade;
  private readonly _criadoEm: Date;
  private _atualizadoEm: Date;

  private constructor(props: ProdutoProps) {
    this._id = props.id;
    this._nome = props.nome;
    this._preco = props.preco;
    this._quantidade = props.quantidade;
    //cópias defensivas, o chamador não mantém referência às datas internas
    this._criadoEm = new Date(props.criadoEm);
    this._atualizadoEm = new Date(props.atualizadoEm);
  }

  static criar(params: CriarProdutoParams, agora: Date = new Date()): Produto {
    return new Produto({
      id: Produto.validarId(params.id),
      nome: Produto.validarNome(params.nome),
      preco: Preco.criar(params.preco),
      quantidade: Quantidade.criar(params.quantidade),
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  static reconstituir(props: ProdutoProps): Produto {
    return new Produto(props);
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get preco(): Preco { return this._preco; }
  get quantidade(): Quantidade { return this._quantidade; }
  get criadoEm(): Date { return new Date(this._criadoEm); }
  get atualizadoEm(): Date { return new Date(this._atualizadoEm); }

  renomear(novoNome: string): void {
    const nomeValidado = Produto.validarNome(novoNome);
    if (nomeValidado === this._nome) return;
    this._nome = nomeValidado;
    this.tocar();
  }

  alterarPreco(novoPreco: number): void {
    this._preco = Preco.criar(novoPreco);
    this.tocar();
  }

  adicionarEstoque(qtd: number): void {
    this._quantidade = this._quantidade.adicionar(Quantidade.criar(qtd));
    this.tocar();
  }

  removerEstoque(qtd: number): void {
    this._quantidade = this._quantidade.remover(Quantidade.criar(qtd));
    this.tocar();
  }

  estaDisponivel(): boolean {
    return this._quantidade.ehMaiorQue(Quantidade.zero());
  }

  equals(outro?: Produto | null): boolean {
    if (!outro) return false;
    return this._id === outro._id;
  }

  private tocar(): void {
    this._atualizadoEm = new Date();
  }

  private static validarId(id: string): string {
    const limpo = id?.trim();
    if (!limpo) {
      throw new ValidationError('id', 'é obrigatório');
    }
    return limpo;
  }

  private static validarNome(nome: string): string {
    const limpo = nome?.trim();
    if (!limpo) {
      throw new ValidationError('nome', 'é obrigatório');
    }
    if (limpo.length < NOME_MIN) {
      throw new ValidationError('nome', `deve ter pelo menos ${NOME_MIN} caracteres`);
    }
    if (limpo.length > NOME_MAX) {
      throw new ValidationError('nome', `deve ter no máximo ${NOME_MAX} caracteres`);
    }
    return limpo;
  }
}