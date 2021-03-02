const USERNAME = process.env.AMQP_USERNAME;
const PASSWORD = process.env.AMQP_PASSWORD
const AMQP_HOST = process.env.AMQP_HOST;

export const AMQP_URL = `amqp://${USERNAME}:${PASSWORD}@${AMQP_HOST}`;