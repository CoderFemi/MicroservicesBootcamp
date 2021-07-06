import request from 'supertest'
import { app } from '../../app'
import { Deal } from '../../models/deal'
import { natsWrapper } from '../../nats-wrapper'

jest.mock('../../nats-wrapper')

it('has a route handler listening to /api/deals for post requests', async () => {
    const response = await request(app)
        .post('/api/deals')
        .send({})
    expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/deals')
        .send({})
})

it('does not return a status of 401 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({})
    expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid deal title is provided', async () => {
    await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 200
        })
        .expect(400)
})

it('returns an error if an invalid deal price is provided', async () => {
    await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({
            title: 'title',
            price: true
        })
        .expect(400)
})

it('creates a deal with valid inputs', async () => {
    let deals = await Deal.find({})
    expect(deals.length).toEqual(0)
    const newDeal = {
        title: 'title',
        price: 250,
    }
    await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send(newDeal)
        .expect(201)
    deals = await Deal.find({})
    expect(deals.length).toEqual(1)
    expect(deals[0].price).toEqual(newDeal.price)
    expect(deals[0].title).toEqual(newDeal.title)
})

it('publishes an event', async () => {
    const newDeal = {
        title: 'title',
        price: 250,
    }
    await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send(newDeal)
        .expect(201)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})