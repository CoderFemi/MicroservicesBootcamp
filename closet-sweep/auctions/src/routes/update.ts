import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
    validateRequest,
    requireAuth,
    NotFoundError,
    NotAuthorisedError
} from '@closetsweep/common'
import { Auction } from '../../models/auction'

const router = express.Router()
const validateBody = [
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
]

router.put('/api/auctions/:id', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const auction = await Auction.findById(req.params.id)
    if (!auction) {
        throw new NotFoundError()
    }
    if (auction.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
    auction.set({
        title: req.body.title,
        price: req.body.price
    })
    await auction.save()
    res.send(auction)
})

export { router as updateAuctionRouter }