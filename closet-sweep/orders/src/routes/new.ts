import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { Deal } from '../models/deal'
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@closetsweep/common'
// import { orderCreatedPublisher } from '../events/publishers/order-created-publisher'
// import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const validateBody = [
    body('dealId')
        .not().isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('Deal Id must be provided'),
]
router.post('/api/orders', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const { dealId } = req.body
    const deal = await Deal.findById(dealId)
    if (!deal) {
        throw new NotFoundError()
    }
    const existingOrder = await Order.findOne({
        deal: deal.id,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })
    if (existingOrder) {
        throw new BadRequestError('Deal has already been taken.')
    }
    
    // await order.save()
    // await new orderCreatedPublisher(natsWrapper.client).publish({
    //     id: order.id,
    //     title: order.title,
    //     price: order.price,
    //     userId: order.userId
    // })
    // res.status(201).send(order)
})

export {router as createOrderRouter}