import Exception from '../Exception';

export default class NotFoundException extends Exception {
  name = 'NotFound';
  message = 'Object could not be found';

  constructor(private topic: string) {
    super();
    this.message = `${this.topic} could not be found`;
  }
}
