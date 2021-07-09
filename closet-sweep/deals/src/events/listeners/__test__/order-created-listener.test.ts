import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Deal } from '../../../models/deal'
import { OrderCreatedEvent, OrderStatus } from '@closetsweep/common'

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)
    const deal = Deal.build({
        title: 'Lawn chair',
        price: 425,
        userId: mongoose.Types.ObjectId().toHexString()
    })
    await deal.save()
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: '125842',
        deal: {
            id: deal.id,
            price: deal.price
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, deal, data, msg }
}

it('sets the userId of the deal', async () => {
    const { listener, deal, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const updatedDeal = await Deal.findById(deal.id)
    expect(updatedDeal!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a deal-updated event', async () => {
    const { listener, deal, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
    const dealUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(data.id).toEqual(dealUpdatedData.orderId)
})