import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
    validateRequest,
    requireAuth,
} from '@closetsweep/common'
import { Order } from '../models/order'
// import { OrderUpdatedPublisher } from '../events/publishers/Order-updated-publisher copy'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete('/api/orders/:orderId', requireAuth, validateRequest, async (req: Request, res: Response) => {
    await Order.findByIdAndDelete(req.params.orderId)
   
    // await new orderUpdatedPublisher(natsWrapper.client).publish({
    //     id: order.id,
    //     title: order.title,
    //     price: order.price,
    //     userId: order.userId
    // })
    res.send({})
})

export { router as deleteOrderRouter }