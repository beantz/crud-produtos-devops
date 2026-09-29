/* Classe base para todos os erros de domínio */
export abstract class DomainError extends Error {
  constructor(message: string) {
    //invoca constructor da classe pai
    super(message);
    //retorna o nome da classe concreta que está sendo instanciada
    this.name = this.constructor.name;
    //new.target.prototype refere-se o prototipo da propria classe, a linha toda redefine o protótipo do objeto recém-criado para o protótipo da subclasse correta.
    Object.setPrototypeOf(this, new.target.prototype);
    //this objeto de erro q recebera a stack e this.constructor aponta para a classe concreta instanciada (qunado aparecer a lista de error, ela vai estar mais otimizada)
    Error.captureStackTrace?.(this, this.constructor);
  }
}