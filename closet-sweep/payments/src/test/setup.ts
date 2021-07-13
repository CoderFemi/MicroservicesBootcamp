import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'
import jwt from 'jsonwebtoken'

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[]
    }
  }
}

jest.mock('../nats-wrapper')
process.env.STRIPE_KEY = 'sk_test_51JCj6ZKzFMtjcQnnIL7bkx0t7Lh4a72MMuVWsbA0bueJJDbs4B4T0RTg9VODE6NxG2fKVid5oL4Ct3zwbHSJYWOy00hNlOw9Ui'

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = (id?: string) => {
  const payload = {
    id: id || mongoose.Types.ObjectId().toHexString(),
    email: 'johnson@gmail.com',
  }

  const token = jwt.sign(payload, process.env.JWT_KEY!)
  const session = { jwt: token }
  const sessionJSON = JSON.stringify(session)
  const base64 = Buffer.from(sessionJSON).toString('base64')
  return [`express:sess=${base64}`]
}
