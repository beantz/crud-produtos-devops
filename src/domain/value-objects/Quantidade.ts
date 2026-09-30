import { ValidationError } from "../errors/ValidationError.js";

export class Quantidade {
  private readonly _valor: number;

  private constructor(valor: number) {
    this._valor = valor;
  }

  static criar(valor: number): Quantidade {
    if (typeof valor !== 'number' || Number.isNaN(valor)) {
      throw new ValidationError('Quantidade', 'deve ser um número válido');
    }
    if (!Number.isInteger(valor)) {
      throw new ValidationError('Quantidade', 'deve ser um número inteiro');
    }
    if (valor < 0) {
      throw new ValidationError('Quantidade', 'não pode ser negativa');
    }
    return new Quantidade(valor);
  }

  static zero(): Quantidade {
    return new Quantidade(0);
  }

  get valor(): number {
    return this._valor;
  }

  adicionar(outro: Quantidade): Quantidade {
    return Quantidade.criar(this._valor + outro._valor);
  }

  remover(outro: Quantidade): Quantidade {
    const resultado = this._valor - outro._valor;
    if (resultado < 0) {
      throw new ValidationError('Quantidade', 'resultado não pode ser negativo');
    }
    return Quantidade.criar(resultado);
  }

  ehMaiorQue(outro: Quantidade): boolean {
    return this._valor > outro._valor;
  }

  equals(outro: Quantidade): boolean {
    return this._valor === outro._valor;
  }
}