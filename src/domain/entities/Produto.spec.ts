import { Produto } from './Produto.js';
import { Quantidade } from '../value-objects/Quantidade.js';
import { ValidationError } from "../errors/ValidationError.js";
import { Preco } from '../value-objects/Preco.js';

const dadosValidos = () => ({
  id: 'p1',
  nome: 'Notebook',
  preco: 3500,
  quantidade: 10,
});

describe('Produto', () => {
  describe('criar', () => {
    it('cria produto válido', () => {
      const p = Produto.criar(dadosValidos());
      expect(p.id).toBe('p1');
      expect(p.nome).toBe('Notebook');
      expect(p.preco.valor).toBe(3500);
      expect(p.quantidade.valor).toBe(10);
      expect(p.estaDisponivel()).toBe(true);
    });

    it('faz trim no nome', () => {
      const p = Produto.criar({ ...dadosValidos(), nome: '  Monitor  ' });
      expect(p.nome).toBe('Monitor');
    });

    it('rejeita nome curto', () => {
      expect(() => Produto.criar({ ...dadosValidos(), nome: 'ab' })).toThrow(
        ValidationError,
      );
    });

    it('rejeita nome vazio', () => {
      expect(() => Produto.criar({ ...dadosValidos(), nome: '' })).toThrow(
        ValidationError,
      );
    });

    it('rejeita id vazio', () => {
      expect(() => Produto.criar({ ...dadosValidos(), id: '' })).toThrow(
        ValidationError,
      );
    });

    it('rejeita preço inválido (propaga do VO)', () => {
      expect(() => Produto.criar({ ...dadosValidos(), preco: -1 })).toThrow(
        ValidationError,
      );
    });

    it('rejeita quantidade inválida (propaga do VO)', () => {
      expect(() =>
        Produto.criar({ ...dadosValidos(), quantidade: 1.5 }),
      ).toThrow(ValidationError);
    });
  });

  describe('comportamentos', () => {
    it('renomeia com validação', () => {
      const p = Produto.criar(dadosValidos());
      p.renomear('Monitor');
      expect(p.nome).toBe('Monitor');
      expect(() => p.renomear('ab')).toThrow(ValidationError);
    });

    it('altera preço', () => {
      const p = Produto.criar(dadosValidos());
      p.alterarPreco(4000);
      expect(p.preco.valor).toBe(4000);
    });

    it('adiciona estoque', () => {
      const p = Produto.criar(dadosValidos());
      p.adicionarEstoque(5);
      expect(p.quantidade.valor).toBe(15);
    });

    it('remove estoque', () => {
      const p = Produto.criar(dadosValidos());
      p.removerEstoque(4);
      expect(p.quantidade.valor).toBe(6);
    });

    it('não permite remover mais que o estoque', () => {
      const p = Produto.criar(dadosValidos());
      expect(() => p.removerEstoque(100)).toThrow(ValidationError);
    });

    it('estaDisponivel é false quando quantidade é zero', () => {
      const p = Produto.criar({ ...dadosValidos(), quantidade: 0 });
      expect(p.estaDisponivel()).toBe(false);
    });

    it('atualiza atualizadoEm ao mutar', async () => {
      const p = Produto.criar(dadosValidos());
      const antes = p.atualizadoEm;
      await new Promise((r) => setTimeout(r, 5));
      p.renomear('Outro nome');
      expect(p.atualizadoEm.getTime()).toBeGreaterThan(antes.getTime());
    });
  });

  describe('reconstituir', () => {
    it('reidrata sem revalidar (permite dados legados)', () => {
      const p = Produto.reconstituir({
        id: 'p1',
        nome: 'ab', // nome inválido segundo regra atual
        preco: Preco.criar(10),
        quantidade: Quantidade.criar(1),
        criadoEm: new Date('2020-01-01'),
        atualizadoEm: new Date('2020-01-01'),
      });
      expect(p.nome).toBe('ab');
    });
  });

  describe('equals', () => {
    it('compara por id, não por valor', () => {
      const a = Produto.criar(dadosValidos());
      const b = Produto.criar({ ...dadosValidos(), nome: 'Outro' });
      const c = Produto.criar({ ...dadosValidos(), id: 'p2' });

      expect(a.equals(b)).toBe(true); // mesmo id
      expect(a.equals(c)).toBe(false); // ids diferentes
    });
  });

  describe('imutabilidade de getters', () => {
    it('criadoEm retorna uma cópia (não vaza referência interna)', () => {
      const p = Produto.criar(dadosValidos());
      const d1 = p.criadoEm;
      d1.setFullYear(1999);
      expect(p.criadoEm.getFullYear()).not.toBe(1999);
    });
  });
});