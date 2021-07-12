import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@closetsweep/common'
import { Order } from '../models/order'
import { BadRequestError, NotAuthorisedError, NotFoundError, OrderStatus } from '@closetsweep/common'
// import { DealCreatedPublisher } from '../events/publishers/deal-created-publisher'
// import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const validateBody = [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty(),
]

router.post('/api/payments', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const { token, orderId } = req.body
    const order = await Order.findById(orderId)
    if (!order) {
        throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order.')
    }
    res.send({success: true})
})

export {router as createChargeRouter}