import express, { Request, Response } from 'express'
import { requireAuth } from '@closetsweep/common'

const router = express.Router()

router.post('/api/auctions', requireAuth, (req: Request, res: Response) => {
    res.sendStatus(200)
})

export {router as createAuctionRouter}