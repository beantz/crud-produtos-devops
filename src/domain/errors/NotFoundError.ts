import { DomainError } from './DomainError.js';

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} com id "${id}" não encontrado`);
  }
}