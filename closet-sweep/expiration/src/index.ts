import { natsWrapper } from './nats-wrapper'

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined!')
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined!')
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined!')
  }
  
  try {
    // Connect to NATS Streaming
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
    // Graceful shutdown
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())
    
  } catch (error) {
    console.log(error)
  }
}
  
start()