import { AmqpOperationHandler } from '../amqp/AmqpOperationHandler';
import { Publisher } from "./Publisher";
import { Subscriber } from './Subscriber';
import { Logger } from '../logger';
import { AmqpProvider } from '../amqp/AmqpProvider';

export enum PubSubInit {
  All,
  Pub,
  Sub,
}

export class PubSubProvider {
  private publisher: Publisher;
  private subscriber: Subscriber;
  private amqp: AmqpProvider = new AmqpProvider();

  constructor(private initState: PubSubInit = PubSubInit.All) { }

  public init() {
    this.amqp.initConnection(() => {
      (this.initState == PubSubInit.All || this.initState == PubSubInit.Pub) && this.initPublisher();
      (this.initState == PubSubInit.All || this.initState == PubSubInit.Sub) && this.initSubscriber();
    });
  }

  private initPublisher() {
    Logger.debug('Publisher init START.');
    this.amqp.createAmqpOpHandler((amqpOpHandler: AmqpOperationHandler) => {
      this.publisher = new Publisher(amqpOpHandler);
      Logger.info('Publisher init END.');
    });
  }

  private initSubscriber() {
    Logger.debug('Subscriber init START.');
    this.amqp.createAmqpOpHandler((amqpOpHandler: AmqpOperationHandler) => {
      this.subscriber = new Subscriber(amqpOpHandler);
      Logger.debug('Subscriber init END.');
    });
  }

  public getPublisher(): Publisher {
    return this.publisher;
  }

  public getSubscriber(): Subscriber {
    return this.subscriber;
  }

}