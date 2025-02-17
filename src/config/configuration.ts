export default () => ({
    mongodb_uri: process.env.MONGODB_URI,
    rabbitmq_uri: process.env.RABBITMQ_URI,
  });