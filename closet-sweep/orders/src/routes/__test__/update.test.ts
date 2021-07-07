import request from 'supertest'
import { app } from '../../app'
import { Deal } from '../../models/deal'
import { OrderStatus } from '@closetsweep/common'
import { natsWrapper } from '../../nats-wrapper'

it('cancels an order', async () => {
    const deal = Deal.build({
        title: 'Bedroom cabinet',
        price: 200
    })
    await deal.save()

    const user = global.signin()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ dealId: deal.id })
        .expect(201)
    
    const { body: updatedOrder } = await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send({ dealId: deal.id })
        .expect(200)
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled)
})

it('publishes an order-cancelled event', async () => {
    const deal = Deal.build({
        title: 'Bedroom cabinet',
        price: 200
    })
    await deal.save()

    const user = global.signin()
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ dealId: deal.id })
        .expect(201)

    await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send({ dealId: deal.id })
        .expect(200)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})