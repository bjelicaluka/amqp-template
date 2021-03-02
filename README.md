# AMQP Pub/Sub TypeScript template
The template project for AMQP Pub/Sub written in TypeScript.

<h3>Start the project:<h3>

<h4>NPM</h4>

```bash
npm i
npm run serve
```

<h4>Docker</h4>

```bash
docker build -t <image>:<tag> .
docker run 
    -e AMQP_USERNAME='test' \
    -e AMQP_PASSWORD='1234'  \
    -e AMQP_HOST='localhost' \
    <image>:<tag>
```

