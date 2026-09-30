import { ValidationError } from "../errors/ValidationError.js";

export class Preco {
    private readonly _centavos: number;

    private constructor(centavos: number) {
        this._centavos = centavos;
    }

    static criar(valor: number): Preco {
        //rejeita NaN, Infinity e -Infinity
        if(typeof valor !== 'number' || !Number.isFinite(valor)){
            throw new ValidationError('Preco', 'deve ser um número finito');
        }

        const centavos = Math.round(valor * 100);
        if(centavos < 0) throw new ValidationError('Preco', 'não pode ser negativo');
        
        return new Preco(centavos);
    }
    
    get valor(): number { 
        return this._centavos / 100; 
    }

    somar(outro: Preco): Preco {
        return new Preco(this._centavos + outro._centavos);
    }

    subtrair(outro: Preco): Preco {
        const r = this._centavos - outro._centavos;
        if (r < 0) throw new ValidationError('Preco', 'subtração resultaria em negativo');
        return new Preco(r);
    }

    multiplicar(fator: number): Preco { 
        return Preco.criar(this.valor * fator); 
    }

    equals(outro?: Preco | null): boolean { 
        return !!outro && this._centavos === outro._centavos; 
    }

    toString(): string { 
        return (this._centavos / 100).toFixed(2); 
    }
}