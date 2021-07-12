import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from '../../../models/order'
import { OrderCancelledEvent, OrderStatus } from '@closetsweep/common'

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 425,
        userId: 'fe4464',
        version: 0
    })
    await order.save()
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        deal: {
            id: 've54w5',
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, order, data, msg }
}

it('updates the order status', async () => {
    const { listener, order, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})