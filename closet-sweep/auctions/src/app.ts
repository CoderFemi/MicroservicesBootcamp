import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@closetsweep/common'
import { createAuctionRouter } from './routes/new'
import { showAuctionRouter } from './routes/show'
import { indexAuctionRouter } from './routes'
import { updateAuctionRouter } from './routes/update'

const app = express()
app.set('trust proxy', true)

app.use(express.json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser)
app.use(createAuctionRouter)
app.use(showAuctionRouter)
app.use(indexAuctionRouter)
app.use(updateAuctionRouter)

app.get('*', () => {
    throw new NotFoundError()
})
app.use(errorHandler)

export { app }