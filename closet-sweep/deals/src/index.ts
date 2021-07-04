import mongoose from 'mongoose'
import { natsWrapper } from './nats-wrapper'
import { app } from './app'

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined!')
  }
  try {
    // Connect to Nats Streaming
    await natsWrapper.connect('deals', 'clientstring', 'http://nats-srv:4222')
    const natsClient = natsWrapper.client
    natsClient.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => natsClient.close())
    process.on('SIGTERM', () => natsClient.close())

    // Connect to Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log('Database connected!')
  } catch (error) {
    console.log(error)
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

start()