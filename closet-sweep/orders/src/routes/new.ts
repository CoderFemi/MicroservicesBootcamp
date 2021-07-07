import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { Deal } from '../models/deal'
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@closetsweep/common'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 10 * 60

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

    const isReserved = await deal.isReserved()
    if (isReserved) {
        throw new BadRequestError('Deal has already been taken.')
    }

    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        deal
    })
    await order.save()
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(), // Convert to UTC timezone format
        deal: {
            id: deal.id,
            price: deal.price
        }
    })
    res.status(201).send(order)
})

export {router as createOrderRouter}