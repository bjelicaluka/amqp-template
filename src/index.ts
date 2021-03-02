import { Message } from 'amqplib';
import { Publisher } from './amqp/Publisher';
import { Subscriber } from './amqp/Subscriber';


const pub = new Publisher();
const sub = new Subscriber();

pub.createConnection();
pub.createChannel();

sub.createConnection();
sub.createChannel();

process.openStdin().addListener("data", function (d) {
  const input = d.toString().trim();
  const tokens = input.split(" ");

  if (tokens[0] === "send") {
    pub.publish(tokens[1], tokens[2], tokens[3]);
  } else if (tokens[0] === 'exchange') {
    pub.assertExchange(tokens[1], 'direct');
  } else if (tokens[0] === 'bind') {
    sub.bindQueue(tokens[1], tokens[2], tokens[3]);
  } else if (tokens[0] === "consume") {
    sub.consume(tokens[1], (msg: Message) => console.log(msg.content.toString()), !!tokens[2]);
  } else if (tokens[0] === "queue") {
    sub.assertQueue(tokens[1]);
  } else if (tokens[0] === "close") {
    if (tokens[1] === 'connection') {
      sub.closeConnection();
      pub.closeConnection();
    } else if (tokens[1] === 'channel') {
      sub.closeChannel();
      pub.closeChannel();
    }
  } else if (tokens[0] === "create") {
    if (tokens[1] === 'connection') {
      sub.createConnection();
      pub.createConnection();
    } else if (tokens[1] === 'channel') {
      sub.createChannel();
      pub.createChannel();
    }
  }
});