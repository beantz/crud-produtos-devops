import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../../application/interfaces/IdGenerator.js';

export class UuidGenerator implements IdGenerator {
  gerar(): string {
    return randomUUID();
  }
}