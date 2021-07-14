import express, { Request, Response } from 'express'
import { Deal } from '../models/deal'

const router = express.Router()

router.get('/api/deals', async (req: Request, res: Response) => {
    const deals = await Deal.find({ orderId: undefined })
    res.send(deals)
})

export { router as indexDealRouter }