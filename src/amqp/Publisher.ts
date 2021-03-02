import { AmqpClient } from './AmqpClient';

export class Publisher extends AmqpClient {

    public assertExchange(exchange: string, type: string, durable: boolean = false) {
        this.amqpOpHandler.assertExchange(exchange, type, durable);
    }

    public publish(exchange: string, routingKey: string, message: string) {
        this.amqpOpHandler.publish(exchange, routingKey, message);
    }

    public sendToQueue(queue: string, message: string) {
        this.amqpOpHandler.sendToQueue(queue, message);
    }

}