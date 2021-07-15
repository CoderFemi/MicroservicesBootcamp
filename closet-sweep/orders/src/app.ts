import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@closetsweep/common'
import { createOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'
import { indexOrderRouter } from './routes'
import { updateOrderRouter } from './routes/update'

const app = express()
app.set('trust proxy', true)

app.use(express.json())
app.use(cookieSession({
    signed: false,
    secure: false
    // secure: process.env.NODE_ENV !== 'test',
}))
app.use(currentUser)
app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(updateOrderRouter)

app.get('*', () => {
    throw new NotFoundError()
})
app.use(errorHandler)

export { app }