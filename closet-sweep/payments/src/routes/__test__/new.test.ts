import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order } from '../../models/order'
import { OrderStatus } from '@closetsweep/common'

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'breg57654',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
})

it('it returns a 401 when purchasing an order that does not belong to current user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        price: 484
    })
    await order.save()
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'breg57654',
            orderId: order.id
        })
        .expect(401)
})

it('it returns a 400 when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        status: OrderStatus.Cancelled,
        price: 484
    })
    await order.save()
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'breg57654',
            orderId: order.id
        })
        .expect(400)
})