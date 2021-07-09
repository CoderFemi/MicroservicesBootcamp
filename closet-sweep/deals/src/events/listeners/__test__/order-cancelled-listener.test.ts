import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Deal } from '../../../models/deal'
import { OrderCancelledEvent, OrderStatus } from '@closetsweep/common'

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    const orderId = mongoose.Types.ObjectId().toHexString()
    const deal = Deal.build({
        title: 'Lawn chair',
        price: 425,
        userId: mongoose.Types.ObjectId().toHexString()
    })
    deal.set({ orderId })
    await deal.save()
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        deal: {
            id: deal.id,
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, orderId, deal, data, msg }
}

it('updates the deal, acks the message, and publishes an event', async () => {
    const { listener, orderId, deal, data, msg } = await setup()
    await listener.onMessage(data, msg)
    
    const updatedDeal = await Deal.findById(deal.id)
    expect(updatedDeal!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})