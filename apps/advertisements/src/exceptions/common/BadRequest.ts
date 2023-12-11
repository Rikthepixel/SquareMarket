import Exception from '../Exception';

export default class BadRequestException extends Exception {
  name = 'BadRequest';
  message = 'Some object caused an invalid state';

  constructor(private topic: string, private reason: string) {
    super();
    this.message = `${this.topic} caused an invalid state due to ${reason}`;
  }
}
