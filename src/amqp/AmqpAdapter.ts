import {Channel, Connection, Message, connect} from 'amqplib/callback_api';
import { stringify } from 'querystring';

import {AMQP_URL} from '../config'


export class AmqpAdapter {
  private channelCreationQueue: Function[];
  private opetaionsQueue: Function[];
  private connection: Connection;
  private channel: Channel;

  constructor() {
    this.channelCreationQueue = [];
    this.opetaionsQueue = [];
  }

  public createConnection() {
    connect(AMQP_URL, (error: any, connection: Connection) => {
      if (error) {
        throw error;
      }
      this.connection = connection;
      this.handleChannelCreationQueue();
    });
  }

  public createChannel() {
    if(!this.channel) {
      this.channelCreationQueue.push(() => this.connection.createChannel((error: any, channel: Channel) => {
        if (error) {
          throw error;
        }
        this.channel = channel;
        this.handleOperationsQueue();
      }));
    }
    this.handleChannelCreationQueue();
  }

  public bindQueue(queue: string, exchange: string, pattern: string = '') {
    this.opetaionsQueue.push(() => this.channel.bindQueue(queue, exchange, pattern))
    this.handleOperationsQueue();
  }

  public assertExchange(exchange: string, type: string, durable: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.assertExchange(exchange, type, { durable }));
    this.handleOperationsQueue();
  }

  public assertQueue(queue: string, durable: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.assertQueue(queue, { durable }));
    this.handleOperationsQueue();
  }

  public publish(exchange: string, routingKey: string, message: string) {
    this.opetaionsQueue.push(() => this.channel.publish(exchange, routingKey, Buffer.from(message)));
    this.handleOperationsQueue();
  }
  
  public sendToQueue(queue: string, message: string) {
    this.opetaionsQueue.push(() => this.channel.sendToQueue(queue, Buffer.from(message)));
    this.handleOperationsQueue();
  }
  
  public consumeFromQueue(queue: string, callback: Function, ack: boolean = false) {
    this.opetaionsQueue.push(() => this.channel.consume(queue, (msg: Message) => {
      callback(msg);
      ack && this.channel.ack(msg);
    }));
    this.handleOperationsQueue();
  }

  private handleChannelCreationQueue() {
    while (this.connection && this.channelCreationQueue.length !== 0) {
      const channelCreation = this.channelCreationQueue.shift();
      channelCreation();
      console.log("Handled item from channel queue.");
    }
    this.handleOperationsQueue();
  }

  private handleOperationsQueue() {
    while (this.channel && this.opetaionsQueue.length !== 0) {
      const operation = this.opetaionsQueue.shift();
      operation();
      console.log("Handled item from operations queue.");
    }
  }
}