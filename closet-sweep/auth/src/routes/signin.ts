import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { BadRequestError } from '../errors/bad-request-error'
import { validateRequest } from '../middleware/validate-request'
import { User } from '../models/user'
import { PasswordManager } from '../utils/password-manager'
import jwt from 'jsonwebtoken'

const router = express.Router()
const validateBody = [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Please supply a password.')
]
router.post('/api/users/signin', validateBody, validateRequest, async (req: Request, res: Response) => {
  const { email, password } = req.body
  const existingUser = await User.findOne({ email })
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials')
  }

  const isValidPassword = await PasswordManager.compare(existingUser.password, password)
  if (!isValidPassword) {
    throw new BadRequestError('Invalid Credentials')
  }
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY!)
  req.session = { jwt: userJwt }

  res.status(200).send(existingUser)
})

export { router as signinRouter }