import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@closetsweep/common'
import { createDealRouter } from './routes/new'
import { showDealRouter } from './routes/show'
import { indexDealRouter } from './routes'
import { updateDealRouter } from './routes/update'

const app = express()
app.set('trust proxy', true)

app.use(express.json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser)
app.use(createDealRouter)
app.use(showDealRouter)
app.use(indexDealRouter)
app.use(updateDealRouter)

app.get('*', () => {
    throw new NotFoundError()
})
app.use(errorHandler)

export { app }