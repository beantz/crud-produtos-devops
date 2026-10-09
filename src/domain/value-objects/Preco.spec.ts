import { Preco } from '../value-objects/Preco.js';
import { ValidationError } from "../errors/ValidationError.js";

describe('Preco', () => {
  describe('criar', () => {
    it('cria um preço válido', () => {
      expect(Preco.criar(10.5).valor).toBe(10.5);
    });

    it('arredonda para 2 casas decimais (evita float impreciso)', () => {
      expect(Preco.criar(0.1 + 0.2).valor).toBe(0.3);
    });

    it('aceita zero', () => {
      expect(Preco.criar(0).valor).toBe(0);
    });

    it('rejeita valor negativo', () => {
      expect(() => Preco.criar(-1)).toThrow(ValidationError);
    });

    it('rejeita NaN', () => {
      expect(() => Preco.criar(NaN)).toThrow(ValidationError);
    });

    it('rejeita Infinity', () => {
      expect(() => Preco.criar(Infinity)).toThrow(ValidationError);
    });
  });

  describe('operações', () => {
    it('soma dois preços sem mutar o original', () => {
      const a = Preco.criar(10);
      const b = Preco.criar(5);
      const c = a.somar(b);

      expect(c.valor).toBe(15);
      expect(a.valor).toBe(10);
      expect(b.valor).toBe(5);
    });

    it('subtrai e rejeita resultado negativo', () => {
      const a = Preco.criar(10);
      expect(a.subtrair(Preco.criar(3)).valor).toBe(7);
      expect(() => a.subtrair(Preco.criar(20))).toThrow(ValidationError);
    });

    it('multiplica por fator', () => {
      expect(Preco.criar(10).multiplicar(2.5).valor).toBe(25);
    });
  });

  describe('equals', () => {
    it('compara por valor', () => {
      expect(Preco.criar(10).equals(Preco.criar(10))).toBe(true);
      expect(Preco.criar(10).equals(Preco.criar(11))).toBe(false);
    });
  });
});