import { Message } from 'amqplib';
import { PubSubProvider } from './pub-sub/PubSubProvider';


const pubSubProvider = new PubSubProvider();
pubSubProvider.init();

const pub = pubSubProvider.getPublisher();
const sub = pubSubProvider.getSubscriber();

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
  }
});