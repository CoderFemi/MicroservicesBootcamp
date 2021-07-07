import express, { Request, Response } from 'express'
import { requireAuth, OrderStatus, NotFoundError, NotAuthorisedError } from '@closetsweep/common'
import { Order } from '../models/order'
// import { OrderUpdatedPublisher } from '../events/publishers/Order-updated-publisher copy'
// import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { status: OrderStatus.Cancelled },
        { new: true, useFindAndModify: false }
    )
    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
    // order.status = OrderStatus.Cancelled
    // await order.save()
    // await new orderUpdatedPublisher(natsWrapper.client).publish({
    //     id: order.id,
    //     title: order.title,
    //     price: order.price,
    //     userId: order.userId
    // })
    res.status(200).send(order)
})

export { router as updateOrderRouter }