import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'
import { RequestValidationError } from '../errors/request-validation-error'
import 'express-async-errors'
import { BadRequestError } from '../errors/bad-request-error'

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
router.post('/api/users/signup', validateBody, async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array())
  }
  const { email, password }: { email: string, password: string } = req.body

  const existingUser = await User.findOne({ email })
  
  if (existingUser) {
    throw new BadRequestError('Email already exists!')
  }

  const user = User.build({ email, password })
  await user.save()

  const userJwt = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_KEY!)
  req.session = { jwt: userJwt }

  res.status(201).send(user)
})

export { router as signupRouter }