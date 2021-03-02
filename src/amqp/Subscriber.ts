import {AmqpAdapter} from './AmqpAdapter';

export class Subscriber {
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