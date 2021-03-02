import {AmqpAdapter} from './AmqpAdapter';

export class Publisher {
    private amqp: AmqpAdapter;

    constructor() {
        this.amqp = new AmqpAdapter();
    }

    public createConnection() {
        this.amqp.createConnection();
    }

    public createChannel() {
        this.amqp.createChannel();
    }

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