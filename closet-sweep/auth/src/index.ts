import express from 'express'
import 'express-async-errors'
import { currentUserRouter } from './routes/current-user'
import { signupRouter } from './routes/signup'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { errorHandler } from './middleware/error-handler'
import { NotFoundError } from './errors/not-found-error'

const app = express()

app.use(express.json())
app.use(currentUserRouter)
app.use(signupRouter)
app.use(signinRouter)
app.use(signoutRouter)

app.get('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)

app.listen(3000, () => {
  console.log('Listening on port 3000!')
})