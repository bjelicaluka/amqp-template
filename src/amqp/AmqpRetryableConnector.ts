import {Channel, Connection, connect} from 'amqplib/callback_api';
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

  public createChannel(onChannelCreateCallback: ChannelCreateCallback) {
    this.channelCreationQueue.push(() => this.createChannelForConnection(onChannelCreateCallback));
    if(this.state !== State.CONNECTED) {
      console.log("Can't create channel if there is no established connection.")
    } else {
      this.handleChannelCreationQueue();
    }
  }

  public closeConnection() {
    if(this.connection) {
      this.connection.close();
      this.state = State.NOT_CONNECTED;
    }
  }

  private createChannelForConnection(onChannelCreateCallback: ChannelCreateCallback) {
    this.connection.createChannel((error: any, channel: Channel) => {
      if (error) {
        console.log("Error when trying to create a channel.\nError info: " + JSON.stringify(error));
        // retry
        setTimeout(() => {
          this.createChannelForConnection(onChannelCreateCallback);
        }, 1000);
        return;
      }
      onChannelCreateCallback(channel);
    });
  }

  public createConnection(onConnectionCallback: Function) {
    this.state = State.CONNECTING;
    connect(AMQP_URL, (error: any, connection: Connection) => {
      if (error) {
        console.log("Error when trying to connect to AMQP server.\nError info: " + JSON.stringify(error));
        // retry
        setTimeout(() => {
          this.createConnection(onConnectionCallback);
        }, CONNECTION_RETRY_TIMEOUT_INTERVAL);
        return;
      }
      this.state = State.CONNECTED;
      this.connection = connection;
      onConnectionCallback(connection);
      this.handleChannelCreationQueue();
    });
  }

  private handleChannelCreationQueue() {
    while(this.state === State.CONNECTED && this.channelCreationQueue.length !== 0) {
      const channelCreation = this.channelCreationQueue.shift();
      channelCreation();
      console.log("Handled channel creation from queue.");
    }
  }
}