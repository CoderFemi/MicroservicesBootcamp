import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Deal } from '../../models/deal'
import { requireAuth, validateRequest } from '@closetsweep/common'
import { DealCreatedPublisher } from '../events/publishers/deal-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const validateBody = [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
]
router.post('/api/deals', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body
    const deal = Deal.build({
        title,
        price,
        userId: req.currentUser!.id
    })
    await deal.save()
    await new DealCreatedPublisher(natsWrapper.client).publish({
        id: deal.id,
        title: deal.title,
        price: deal.price,
        userId: deal.userId
    })
    res.status(201).send(deal)
})

export {router as createDealRouter}