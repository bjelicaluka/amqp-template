# AMQP Pub/Sub TypeScript template
The template project for AMQP Pub/Sub written in TypeScript.

<b><h3>Start the project for development environment:<h3></b>

<h4>NPM</h4>

```bash
export AMQP_USERNAME='test'
export AMQP_PASSWORD='1234'
export AMQP_HOST='localhost'

npm i
npm start
```

<h4>Docker</h4>

```bash
docker build -t <image>:<tag> .
docker run 
    -e AMQP_USERNAME='test' \
    -e AMQP_PASSWORD='1234'  \
    -e AMQP_HOST='localhost' \
    -e NODE_ENV='development' \
    <image>:<tag>
```

<b><h3>Start the project for production environment:<h3></b>

<h4>NPM</h4>

```bash
npm i
npm run build
rm -r node_modules # optionally delete node_modules folder
npm ci --production

export AMQP_USERNAME='test'
export AMQP_PASSWORD='1234'
export AMQP_HOST='localhost'
export NODE_ENV='production'

node dist/index.js
```

<h4>Docker</h4>

```bash
docker build -t <image>:<tag> .
docker run 
    -e AMQP_USERNAME='test' \
    -e AMQP_PASSWORD='1234'  \
    -e AMQP_HOST='localhost' \
    -e NODE_ENV='production' \
    <image>:<tag>
```

<b><h3>Example usage of pub-sub module:</h3></b>

```js
const pubSubProvider = new PubSubProvider();
pubSubProvider.init();

const pub = pubSubProvider.getPublisher();
const sub = pubSubProvider.getSubscriber();

pub.assertExchange('exchange_1', 'direct');
pub.publish('exchange_1', 'route_1', 'message');
sub.bindQueue('queue_1', 'exchange_1', 'route*');
sub.consume('queue_1', (msg: Message) => console.log(msg.content.toString()), false);
sub.assertQueue('queue_1', true);
```