import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from '../../../models/order'
import { Deal } from '../../../models/deal'
import { OrderStatus, ExpirationCompleteEvent } from '@closetsweep/common'

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)
    const deal = Deal.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Microwave Oven',
        price: 1250
    })
    await deal.save()
    const order = Order.build({
        status: OrderStatus.Created,
        userId: '12345',
        expiresAt: new Date(),
        deal
    })
    await order.save()
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, order, deal, data, msg }
}

it('updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an OrderCancelled event', async () => {
    const { listener, order, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})