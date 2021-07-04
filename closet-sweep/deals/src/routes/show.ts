import express, { Request, Response } from 'express'
import { Deal } from '../../models/deal'
import { NotFoundError } from '@closetsweep/common'

const router = express.Router()

router.get('/api/deals/:id', async (req: Request, res: Response) => {
    const deal = await Deal.findById(req.params.id)
    if (!deal) {
        throw new NotFoundError()
    }
    res.send(deal)
})

export { router as showDealRouter }