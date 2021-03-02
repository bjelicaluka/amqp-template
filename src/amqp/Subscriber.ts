import {AmqpAdapter} from './AmqpAdapter';
import { AmqpClient } from './AmqpClient';

export class Subscriber extends AmqpClient {

    public assertQueue(queue: string, durable: boolean = false) {
        this.amqp.assertQueue(queue, durable);
    }

    public consume(queue: string, callback: Function, ack: boolean = false) {
        this.amqp.consumeFromQueue(queue, callback, ack);
    }

    public bindQueue(queue: string, exchange: string, pattern: string = '') {
        this.amqp.bindQueue(queue, exchange, pattern)
    }

}