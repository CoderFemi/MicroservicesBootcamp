import express, { Request, Response } from 'express'
import { Order } from '../models/order'
import { NotFoundError } from '@closetsweep/common'

const router = express.Router()

router.get('/api/orders/:orderId', async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId)
    if (!order) {
        throw new NotFoundError()
    }
    res.send(order)
})

export { router as showOrderRouter }