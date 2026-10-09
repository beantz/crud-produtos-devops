import { Quantidade } from '../value-objects/Quantidade.js';
import { ValidationError } from "../errors/ValidationError.js";

describe('Quantidade', () => {
  describe('criar', () => {
    it('cria quantidade válida', () => {
      expect(Quantidade.criar(5).valor).toBe(5);
    });

    it('aceita zero', () => {
      expect(Quantidade.criar(0).valor).toBe(0);
    });

    it('rejeita decimal', () => {
      expect(() => Quantidade.criar(1.5)).toThrow(ValidationError);
    });

    it('rejeita negativo', () => {
      expect(() => Quantidade.criar(-1)).toThrow(ValidationError);
    });

    it('rejeita NaN', () => {
      expect(() => Quantidade.criar(NaN)).toThrow(ValidationError);
    });
  });

  describe('operações', () => {
    it('adiciona sem mutar', () => {
      const a = Quantidade.criar(10);
      const b = Quantidade.criar(5);
      expect(a.adicionar(b).valor).toBe(15);
      expect(a.valor).toBe(10);
    });

    it('remove', () => {
      expect(Quantidade.criar(10).remover(Quantidade.criar(3)).valor).toBe(7);
    });

    it('rejeita remoção que resultaria em negativo', () => {
      expect(() =>
        Quantidade.criar(2).remover(Quantidade.criar(5)),
      ).toThrow(ValidationError);
    });

    it('ehMaiorQue compara', () => {
      expect(Quantidade.criar(5).ehMaiorQue(Quantidade.criar(3))).toBe(true);
      expect(Quantidade.criar(3).ehMaiorQue(Quantidade.criar(5))).toBe(false);
    });
  });

  describe('equals', () => {
    it('compara por valor', () => {
      expect(Quantidade.criar(5).equals(Quantidade.criar(5))).toBe(true);
      expect(Quantidade.criar(5).equals(Quantidade.criar(6))).toBe(false);
    });
  });
});