import express, { Request, Response } from 'express'
import { requireAuth, OrderStatus, NotFoundError, NotAuthorisedError } from '@closetsweep/common'
import { Order } from '../models/order'
import { natsWrapper } from '../nats-wrapper'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'

const router = express.Router()

router.put('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { status: OrderStatus.Cancelled },
        { new: true, useFindAndModify: false }
    ).populate('deal')
    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
   
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        deal: {
            id: order.deal.id
        },
        version: order.version
    })
    res.status(200).send(order)
})

export { router as updateOrderRouter }