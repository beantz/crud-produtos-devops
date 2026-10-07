import { DomainError } from './DomainError.js';

export class DuplicateProductError extends DomainError {
  constructor(id: string) {
    super(`Produto com id "${id}" ja existe!`);
  }
}