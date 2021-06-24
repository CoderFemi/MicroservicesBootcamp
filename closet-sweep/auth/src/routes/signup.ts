import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'

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
    return res.status(400).send(errors.array())
  }
  const { email, password }: { email: string, password: string } = req.body
  
  return res.send(`Welcome, ${email}`)
})

export { router as signupRouter }