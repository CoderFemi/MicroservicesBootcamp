import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Deal } from '../../models/deal'
import { OrderStatus } from '@closetsweep/common'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error if the deal does not exist', async () => {
    const dealId = mongoose.Types.ObjectId()
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ dealId })
        .expect(404)
    
})

it('returns an error if the deal is already taken', async () => {
    const deal = Deal.build({
        title: 'Kitchen drawer',
        price: 1200
    })
    await deal.save()
    const order = Order.build({
        deal,
        userId: 'randomId1234',
        status: OrderStatus.Created,
        expiresAt: new Date()
    })
    await order.save()
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ dealId: deal.id })
        .expect(400)
})

it('reserves a deal', async () => {
    const deal = Deal.build({
        title: 'Kitchen drawer',
        price: 1200
    })
    await deal.save()
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ dealId: deal.id })
        .expect(201)
})

it('emits an order created event', async () => {
    const deal = Deal.build({
        title: 'Kitchen drawer',
        price: 1200
    })
    await deal.save()
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ dealId: deal.id })
        .expect(201)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})