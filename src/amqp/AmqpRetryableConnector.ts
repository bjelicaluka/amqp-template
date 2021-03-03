import {Channel, Connection, connect} from 'amqplib/callback_api';
import { Logger } from '../logger';
import {AMQP_URL, CONNECTION_RETRY_TIMEOUT_INTERVAL} from '../config'

type ChannelCreateCallback = (channel: Channel) => void;
enum State {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED
}

export class AmqpRetryableConnector {
  private channelCreationQueue: Function[] = [];
  private connection: Connection;
  private state: State = State.NOT_CONNECTED;

  constructor() { }

  public createConnection(onConnectionCallback: Function) {
    Logger.debug('Connecting to AMQP server START.');
    this.state = State.CONNECTING;
    connect(AMQP_URL, (error: any, connection: Connection) => {
      if (error) {
        Logger.error("Error when trying to connect to AMQP server. Error info: " + JSON.stringify(error));
        // retry
        setTimeout(() => {
          Logger.info("Attempting to connect to AMQP server after failure.");
          this.createConnection(onConnectionCallback);
        }, CONNECTION_RETRY_TIMEOUT_INTERVAL);
        return;
      }
      Logger.info("Connected to AMQP server.");
      this.state = State.CONNECTED;
      this.connection = connection;
      onConnectionCallback(connection);
      this.handleChannelCreationQueue();
    });
  }

  public createChannel(onChannelCreateCallback: ChannelCreateCallback) {
    this.channelCreationQueue.push(() => this.createChannelForConnection(onChannelCreateCallback));
    Logger.info(`Inserted channel creation in queue, there are ${this.channelCreationQueue.length} items in the queue.`);
    if(this.state !== State.CONNECTED) {
      Logger.error("Can't create channel if there is no established connection.");
    } else {
      this.handleChannelCreationQueue();
    }
  }

  public closeConnection() {
    Logger.debug('Close connection START.');
    if(this.connection) {
      this.connection.close();
      this.state = State.NOT_CONNECTED;
    }
    Logger.debug('Close connection END.');
  }

  private createChannelForConnection(onChannelCreateCallback: ChannelCreateCallback) {
    this.connection.createChannel((error: any, channel: Channel) => {
      if (error) {
        Logger.error("Error when trying to create a channel. Error info: " + JSON.stringify(error));
        // retry
        setTimeout(() => {
          Logger.info("Attempting to create a Channel after failure.");
          this.createChannelForConnection(onChannelCreateCallback);
        }, CONNECTION_RETRY_TIMEOUT_INTERVAL);
        return;
      }
      Logger.info('Channel created successfully.');
      onChannelCreateCallback(channel);
    });
  }

  private handleChannelCreationQueue() {
    Logger.debug(`Handle operations from channel creation queue START.`);
    while(this.state === State.CONNECTED && this.channelCreationQueue.length !== 0) {
      const channelCreation = this.channelCreationQueue.shift();
      channelCreation();
      Logger.info(`Handled channel creation from queue, there are ${this.channelCreationQueue.length} items left in the queue.`);
    }
    Logger.debug(`Handle operations from channel creation queue END.`);
  }
}