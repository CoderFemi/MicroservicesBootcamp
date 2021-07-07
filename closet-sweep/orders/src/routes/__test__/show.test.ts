import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Deal } from '../../models/deal'

// jest.mock('../../nats-wrapper')

it('returns a 401 if order does not belong to user', async () => {
    const deal = Deal.build({
        title: 'Lawn mower',
        price: 320
    })
    await deal.save()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ dealId: deal.id })
        .expect(201)

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .expect(401)
})

it('fetches the order', async () => {
    const deal = Deal.build({
        title: 'Lawn mower',
        price: 320
    })
    await deal.save()

    const user = global.signin()

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ dealId: deal.id })
        .expect(201)
    
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200)
    
    expect(fetchedOrder.id).toEqual(order.id)
})