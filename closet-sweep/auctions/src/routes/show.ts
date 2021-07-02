import express, { Request, Response } from 'express'
import { Auction } from '../../models/auction'
import { NotFoundError } from '@closetsweep/common'

const router = express.Router()

router.get('/api/auctions/:id', async (req: Request, res: Response) => {
    const auction = await Auction.findById(req.params.id)
    if (!auction) {
        throw new NotFoundError()
    }
    res.send(auction)
})

export { router as showAuctionRouter }