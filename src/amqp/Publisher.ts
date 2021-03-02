import {AmqpAdapter} from './AmqpAdapter';
import { AmqpClient } from './AmqpClient';

export class Publisher extends AmqpClient {

    public assertExchange(exchange: string, type: string, durable: boolean = false) {
        this.amqp.assertExchange(exchange, type, durable);
    }

    public publish(exchange: string, routingKey: string, message: string) {
        this.amqp.publish(exchange, routingKey, message);
    }

    public sendToQueue(queue: string, message: string) {
        this.amqp.sendToQueue(queue, message);
    }

}