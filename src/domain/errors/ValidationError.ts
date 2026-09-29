import { DomainError } from './DomainError.js';

export class ValidationError extends DomainError {
  public readonly field: string;
  public readonly reason: string;

  constructor(field: string, reason: string) {
    super(`Validação falhou em "${field}": ${reason}`);
    this.field = field;
    this.reason = reason;
  }
}