import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

let mongo: any
beforeAll(async () => {
    process.env.JWT_KEY = 'authsecret'
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
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

// Make cookie globally available to all tests to avoid repetition.
// only available in test environment.
global.signin = () => {
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'johnson@gmail.com'
    }

    const token = jwt.sign(payload, process.env.JWT_KEY!)
    const session = { jwt: token }
    const sessionJSON = JSON.stringify(session)
    const base64 = Buffer.from(sessionJSON).toString('base64')
    return [`express:sess=${base64}`]
}