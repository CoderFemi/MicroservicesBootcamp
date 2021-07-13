import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order } from '../../models/order'
import { OrderStatus } from '@closetsweep/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

// jest.mock('../../stripe') // To be used when not using the real stripe api

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

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 10000)
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        status: OrderStatus.Created,
        price
    })
    await order.save()
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201)
    
    // EXPECTATIONS FOR THE MOCK API
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    // expect(chargeOptions.source).toEqual('tok_visa')
    // expect(chargeOptions.amount).toEqual(4250 * 100)
    // expect(chargeOptions.currency).toEqual('usd')

    const stripeCharges = await stripe.charges.list({ limit: 20 })
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100)

    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toEqual('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull()
})