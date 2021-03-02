import { Message } from 'amqplib';
import {Publisher} from './amqp/Publisher';
import { Subscriber } from './amqp/Subscriber';


const pub = new Publisher();
const sub = new Subscriber();

process.openStdin().addListener("data", function(d) { 
    const input = d.toString().trim();
    const tokens = input.split(" ");

    pub.createConnection();
    pub.createChannel();

    sub.createConnection();
    sub.createChannel();

    if(tokens[0] === "send") {
      pub.publish(tokens[1], tokens[2], tokens[3]);
    } else if(tokens[0] === 'exchange') {
      pub.assertExchange(tokens[1], 'direct');
    } else if(tokens[0] === 'bind') {
      sub.bindQueue(tokens[1], tokens[2], tokens[3]);
    } else if(tokens[0] === "consume") {
      sub.consume(tokens[1], (msg: Message) => console.log(msg.content.toString()), !!tokens[2]);
    } else if(tokens[0] === "assert") {
      sub.assertQueue(tokens[1]);
    }
  });