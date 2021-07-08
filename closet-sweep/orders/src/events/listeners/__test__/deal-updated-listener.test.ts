import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { DealUpdatedListener } from "../deal-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Deal } from '../../../models/deal'
import { DealUpdatedEvent } from '@closetsweep/common'

const setup = async () => {
    const listener = new DealUpdatedListener(natsWrapper.client)
    const deal = Deal.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Microwave Oven',
        price: 1250
    })
    await deal.save()
    const data: DealUpdatedEvent['data'] = {
        version: deal.version + 1,
        id: deal.id,
        title: 'Microwave Oven UPDATED',
        price: 900,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, deal, data, msg }
}

it('finds, updates and saves a ticket', async () => {
    const { listener, deal, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const updatedDeal = await Deal.findById(deal.id)
    expect(updatedDeal!.title).toEqual(data.title)
    expect(updatedDeal!.price).toEqual(data.price)
    expect(updatedDeal!.version).toEqual(data.version)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})