import type { IdGenerator } from '../../application/interfaces/IdGenerator.js';

export class FakeIdGenerator implements IdGenerator {
  private contador = 0;

  gerar(): string {
    return `id-${++this.contador}`;
  }
}
