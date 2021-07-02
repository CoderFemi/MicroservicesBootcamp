import express, { Request, Response } from 'express'
import { Auction } from '../../models/auction'

const router = express.Router()

router.get('/api/auctions', async (req: Request, res: Response) => {
    const auctions = await Auction.find({})
    res.send(auctions)
})

export { router as indexAuctionRouter }