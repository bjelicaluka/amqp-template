import {Channel, Message} from 'amqplib/callback_api';
import { Logger } from '../logger';

enum State {
  Open,
  Closed
}

export class AmqpOperationHandler {
  private state: State;
  private opetaionsQueue: Function[] = [];

  constructor(private channel: Channel) {
    this.setOpenState();  
  }

  public setOpenedChannel(channel: Channel) {
    Logger.debug('AmqpOperationHandler set new opened Channel.');
    this.channel = channel;
    this.setOpenState();
    this.handleOperationsFromQueue();
  }

  public setClosedState() {
    Logger.debug('AmqpOperationHandler state CLOSED.');
    this.state = State.Closed;
  }

  private setOpenState() {
    Logger.debug('AmqpOperationHandler state OPEN.');
    this.state = State.Open;
  }

  public closeChannel() {
    Logger.debug('AmqpOperationHandler Channel closing START.');
    this.setClosedState();
    this.channel.close(() => {
      Logger.debug('AmqpOperationHandler Channel closing END.');
    });
  }

  public bindQueue(queue: string, exchange: string, pattern: string = '') {
    Logger.debug(`Bind Queue '${queue}' to '${exchange}' Exchange with '${pattern}' pattern START.`);
    this.addOperationToQueue(() => this.channel.bindQueue(queue, exchange, pattern))
    this.handleOperationsFromQueue();
  }

  public assertExchange(exchange: string, type: string, durable: boolean = false) {
    Logger.debug(`Assert Exchange '${exchange}' of type '${type}' ${durable ? 'to be' : 'not being'} durable START.`);
    this.addOperationToQueue(() => this.channel.assertExchange(exchange, type, { durable }));
    this.handleOperationsFromQueue();
  }

  public assertQueue(queue: string, durable: boolean = false) {
    Logger.debug(`Assert Queue '${queue}' ${durable ? 'to be' : 'not being'} durable START.`);
    this.addOperationToQueue(() => this.channel.assertQueue(queue, { durable }));
    this.handleOperationsFromQueue();
  }

  public publish(exchange: string, routingKey: string, message: string) {
    Logger.debug(`Publish message to Exchange '${exchange}' with '${routingKey}' routing key START.`);
    this.addOperationToQueue(() => this.channel.publish(exchange, routingKey, Buffer.from(message)));
    this.handleOperationsFromQueue();
  }
  
  public sendToQueue(queue: string, message: string) {
    Logger.debug(`Send message to Queue '${queue}' START.`);
    this.addOperationToQueue(() => this.channel.sendToQueue(queue, Buffer.from(message)));
    this.handleOperationsFromQueue();
  }
  
  public consumeFromQueue(queue: string, callback: Function, ack: boolean = false) {
    Logger.debug(`Consume messages from Queue '${queue}' ${ack ? 'with' : 'without'} acknowledgement START.`);
    this.addOperationToQueue(() => this.channel.consume(queue, (msg: Message) => {
      Logger.info(`Consumed a message from '${queue}'.`);
      callback(msg);
      ack && this.channel.ack(msg);
    }));
    this.handleOperationsFromQueue();
  }

  private addOperationToQueue(operation: Function) {
    this.opetaionsQueue.push(operation);
    Logger.info(`Inserted operation in queue, there are ${this.opetaionsQueue.length} items in the queue.`);
  }

  private handleOperationsFromQueue() {
    Logger.debug(`Handle operations from queue START.`);
    while (this.state === State.Open && this.channel && this.opetaionsQueue.length !== 0) {
      const operation = this.opetaionsQueue.shift();
      operation();
      Logger.info(`Handled item from operations queue, there are ${this.opetaionsQueue.length} items left in the queue.`);
    }
    Logger.debug(`Handle operations from queue END.`);
  }
}