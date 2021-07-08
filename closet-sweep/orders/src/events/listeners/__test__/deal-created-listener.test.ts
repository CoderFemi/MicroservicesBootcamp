import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { DealCreatedListener } from "../deal-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Deal } from '../../../models/deal'
import { DealCreatedEvent } from '@closetsweep/common'

const setup = async () => {
    const listener = new DealCreatedListener(natsWrapper.client)
    const data: DealCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Microwave Oven',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg}
}

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const deal = await Deal.findById(data.id)
    expect(deal).toBeDefined()
    expect(deal!.title).toEqual(data.title)
    expect(deal!.price).toEqual(data.price)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})