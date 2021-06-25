import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { RequestValidationError } from '../errors/request-validation-error'
import { DatabaseError } from '../errors/database-error'

const router = express.Router()
const validateBody = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters.')
]
router.post('/api/users/signup', validateBody, (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array())
  }
  const { email, password }: { email: string, password: string } = req.body

  throw new DatabaseError()
  
  return res.send(`Welcome, ${email}`)
})

export { router as signupRouter }