import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined!')
  }
  try {
    // Connect to NATS Streaming
    await natsWrapper.connect('closetsweep', 'random1234', 'http://nats-srv:4222')
    // Graceful shutdown
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

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