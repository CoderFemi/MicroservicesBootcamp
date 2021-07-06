import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
    validateRequest,
    requireAuth,
    NotFoundError,
    NotAuthorisedError
} from '@closetsweep/common'
import { Deal } from '../models/deal'
import { DealUpdatedPublisher } from '../events/publishers/deal-updated-publisher copy'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()
const validateBody = [
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
]

router.put('/api/deals/:id', requireAuth, validateBody, validateRequest, async (req: Request, res: Response) => {
    const deal = await Deal.findById(req.params.id)
    if (!deal) {
        throw new NotFoundError()
    }
    if (deal.userId !== req.currentUser!.id) {
        throw new NotAuthorisedError()
    }
    deal.set({
        title: req.body.title,
        price: req.body.price
    })
    await deal.save()
    await new DealUpdatedPublisher(natsWrapper.client).publish({
        id: deal.id,
        title: deal.title,
        price: deal.price,
        userId: deal.userId
    })
    res.send(deal)
})

export { router as updateDealRouter }