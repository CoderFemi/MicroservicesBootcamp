import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@closetsweep/common'
import { createAuctionRouter } from './routes/new'

const app = express()
app.set('trust proxy', true)

app.use(express.json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser)
app.use(createAuctionRouter)
// app.use(signupRouter)
// app.use(signinRouter)
// app.use(signoutRouter)

app.get('*', () => {
    throw new NotFoundError()
})
app.use(errorHandler)

export { app }