import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Auction } from '../../models/auction'
import { requireAuth, validateRequest } from '@closetsweep/common'

const router = express.Router()

const validateBody = [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
]
router.post('/api/auctions', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body
    const auction = Auction.build({
        title,
        price,
        userId: req.currentUser!.id
    })
    await auction.save()
    res.status(201).send(auction)
})

export {router as createAuctionRouter}