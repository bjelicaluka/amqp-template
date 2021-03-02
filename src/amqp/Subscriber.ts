import { AmqpClient } from './AmqpClient';

export class Subscriber extends AmqpClient {    

    public assertQueue(queue: string, durable: boolean = false) {
        this.amqpOpHandler.assertQueue(queue, durable);
    }

    public consume(queue: string, callback: Function, ack: boolean = false) {
        this.amqpOpHandler.consumeFromQueue(queue, callback, ack);
    }

    public bindQueue(queue: string, exchange: string, pattern: string = '') {
        this.amqpOpHandler.bindQueue(queue, exchange, pattern)
    }

}