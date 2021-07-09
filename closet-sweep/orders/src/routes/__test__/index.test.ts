import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Deal } from '../../models/deal'

// jest.mock('../../nats-wrapper')

const buildDeal = async () => {
    const deal = Deal.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Bathroom mirror',
        price: 1500
    })
    await deal.save()
    return deal
}
it('fetches orders for a signed-in user', async () => {
    const dealOne = await buildDeal()
    const dealTwo = await buildDeal()
    const dealThree = await buildDeal()

    const userOne = global.signin()
    const userTwo = global.signin()

    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ dealId: dealOne.id })
        .expect(201)
    
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ dealId: dealTwo.id })
        .expect(201)
    
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ dealId: dealThree.id })
        .expect(201)
    
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].id).toEqual(orderTwo.id)
    expect(response.body[0].deal.id).toEqual(dealTwo.id)
    expect(response.body[1].deal.id).toEqual(dealThree.id)
})