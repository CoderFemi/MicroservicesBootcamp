import express, { Request, Response } from 'express'
import { Order } from '../models/order'
import { requireAuth, NotFoundError, NotAuthorisedError } from '@closetsweep/common'

const router = express.Router()

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order
        .findById(req.params.orderId)
        .populate('deal')
    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
    res.send(order)
})

export { router as showOrderRouter }