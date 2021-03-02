import { Connection } from 'amqplib/callback_api';
import { AmqpOperationHandler } from './AmqpOperationHandler';
import { AmqpRetryableConnector } from './AmqpRetryableConnector';
import { Publisher } from "./Publisher";
import { Subscriber } from './Subscriber';
import { CONNECTION_RETRY_TIMEOUT_INTERVAL } from '../config';

export class Amqp {
  private publisher: Publisher;
  private subscriber: Subscriber;
  private connector: AmqpRetryableConnector;

  public initAll() {
    this.connector = new AmqpRetryableConnector();

    this.createConnection();

    this.initPublisher();
    this.initSubscriber();
  }

  public initPublisher() {
    this.createAmqpOpHandler((amqpOpHandler: AmqpOperationHandler) => {
      this.publisher = new Publisher(amqpOpHandler);
    });
  }

  public initSubscriber() {
    this.createAmqpOpHandler((amqpOpHandler: AmqpOperationHandler) => {
      this.subscriber = new Subscriber(amqpOpHandler);
    });
  }

  public getPublisher(): Publisher {
    return this.publisher;
  }

  public getSubscriber(): Subscriber {
    return this.subscriber;
  }

  public closeConnection() {
    this.connector.closeConnection();
  }

  public createConnection(onConnectionCreated: Function = () => {}) {
    this.connector.createConnection((connection: Connection) => {
      connection.on("close", () => {
        console.log("Connection with AMQP server has been lost.");

        this.subscriber.setClosedState();
        this.publisher.setClosedState();

        return setTimeout(() => { this.onConnectionClosed() }, CONNECTION_RETRY_TIMEOUT_INTERVAL);
      });

      onConnectionCreated(connection);
    });
  }

  private createAmqpOpHandler(onAmqpOpHandlerCreated: Function) {
    this.connector.createChannel(channel => {
      const amqpOpHandler = new AmqpOperationHandler(channel);
      onAmqpOpHandlerCreated(amqpOpHandler);
    });
  }

  private onConnectionClosed() {
    this.createConnection(() => {
      this.connector.createChannel(channel => {
        this.subscriber.setOpenedChannel(channel);
      });
      this.connector.createChannel(channel => {
        this.publisher.setOpenedChannel(channel);
      });
    });
  }

}