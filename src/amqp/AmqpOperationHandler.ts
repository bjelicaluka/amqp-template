import {Channel, Message} from 'amqplib/callback_api';

enum State {
  Open,
  Closed
}

export class AmqpOperationHandler {
  private state: State;
  private opetaionsQueue: Function[] = [];

  constructor(private channel: Channel) {
    this.state = State.Open;
  }

  public setOpenedChannel(channel: Channel) {
    this.channel = channel;
    this.state = State.Open;
    this.handleOperationsFromQueue();
  }

  public setClosedState() {
    this.state = State.Closed;
  }

  public closeChannel() {
    this.setClosedState();
    this.channel.close(() => {
      console.log('Channel closed successfully.')
    });
  }

  public bindQueue(queue: string, exchange: string, pattern: string = '') {
    this.opetaionsQueue.push(() => this.channel.bindQueue(queue, exchange, pattern))
    this.handleOperationsFromQueue();
  }

  public assertExchange(exchange: string, type: string, durable: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.assertExchange(exchange, type, { durable }));
    this.handleOperationsFromQueue();
  }

  public assertQueue(queue: string, durable: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.assertQueue(queue, { durable }));
    this.handleOperationsFromQueue();
  }

  public publish(exchange: string, routingKey: string, message: string) {
    this.opetaionsQueue.push(() => this.channel.publish(exchange, routingKey, Buffer.from(message)));
    this.handleOperationsFromQueue();
  }
  
  public sendToQueue(queue: string, message: string) {
    this.opetaionsQueue.push(() => this.channel.sendToQueue(queue, Buffer.from(message)));
    this.handleOperationsFromQueue();
  }
  
  public consumeFromQueue(queue: string, callback: Function, ack: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.consume(queue, (msg: Message) => {
      callback(msg);
      ack && this.channel.ack(msg);
    }));
    this.handleOperationsFromQueue();
  }

  private handleOperationsFromQueue() {
    while (this.state === State.Open && this.channel && this.opetaionsQueue.length !== 0) {
      const operation = this.opetaionsQueue.shift();
      operation();
      console.log("Handled item from operations queue.");
    }
  }
}