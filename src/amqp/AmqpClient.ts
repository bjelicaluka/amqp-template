import {AmqpAdapter} from './AmqpAdapter';

export class AmqpClient {
    protected amqp: AmqpAdapter;

    constructor() {
        this.amqp = new AmqpAdapter();
    }

    public createConnection() {
        this.amqp.createConnection();
    }
    
    public closeConnection() {
        this.amqp.closeConnection();
    }

    public createChannel() {
        this.amqp.createChannel();
    }

    public closeChannel() {
        this.amqp.closeChannel();
    }

}