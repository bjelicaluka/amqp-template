import { Connection } from 'amqplib/callback_api';
import { AmqpOperationHandler } from './AmqpOperationHandler';
import { AmqpRetryableConnector } from './AmqpRetryableConnector';
import { CONNECTION_RETRY_TIMEOUT_INTERVAL } from '../config';
import { Logger } from '../logger';

export class AmqpProvider {
  private connector: AmqpRetryableConnector;
  private amqpOpHandlers: AmqpOperationHandler[] = [];

  public initConnection(onConnectionCreated: Function) {
    Logger.debug('Amqp init connection START.');
    this.connector = new AmqpRetryableConnector();

    this.createConnection(onConnectionCreated);
    Logger.debug('Amqp init connection END.');
  }

  public closeConnection() {
    this.connector.closeConnection();
  }

  public createConnection(onConnectionCreated: Function = () => {}) {
    Logger.debug('Amqp connection create START.');
    this.connector.createConnection((connection: Connection) => {
      connection.on("close", () => {
        Logger.error("Connection with AMQP server has been lost.");

        this.amqpOpHandlers.forEach(amqpOpHandler => {
          amqpOpHandler.setClosedState();
        });

        return setTimeout(() => { this.attemptToReconnect() }, CONNECTION_RETRY_TIMEOUT_INTERVAL);
      });

      onConnectionCreated(connection);
      Logger.debug('Amqp connection create END.');
    });
  }

  public createAmqpOpHandler(onAmqpOpHandlerCreated: Function) {
    this.connector.createChannel(channel => {
      const amqpOpHandler = new AmqpOperationHandler(channel);
      this.amqpOpHandlers.push(amqpOpHandler);
      onAmqpOpHandlerCreated(amqpOpHandler);
    });
  }

  private attemptToReconnect() {
    Logger.info('Attempting to reconnect to AMQP server.');
    this.createConnection(() => {
      Logger.info('Reconnected to AMQP server.');

      this.amqpOpHandlers.forEach(amqpOpHandler => {
        this.connector.createChannel(channel => {
          amqpOpHandler.setOpenedChannel(channel);
        });
      });
      
    });
  }

}