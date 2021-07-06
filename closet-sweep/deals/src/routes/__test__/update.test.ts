import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'

jest.mock('../../nats-wrapper')
const id = new mongoose.Types.ObjectId().toHexString()

it('returns a 404 if the provided id does not exist', async () => {
    await request(app)
        .put(`/api/deals/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Cooker',
            price: 360
        })
        .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
    await request(app)
        .put(`/api/deals/${id}`)
        .send({
            title: 'Cooker',
            price: 360
        })
        .expect(401)
})

it('returns a 401 if the user does not own the deal', async () => {
    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({
            title: 'Grey Jeans',
            price: 251
        })
    
    await request(app)
        .put(`/api/deals/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: "Black Jeans",
            price: 54
        })
        .expect(401)
})

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', cookie)
        .send({
            title: 'Grey Jeans',
            price: 251
        })
    
    await request(app)
        .put(`/api/deals/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 360
        })
        .expect(400)
    
    await request(app)
        .put(`/api/deals/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Grey Jeans',
            price: -360
        })
        .expect(400)
    
})

it('returns a 200 if the provided inputs are valid', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', cookie)
        .send({
            title: 'Grey Jeans',
            price: 251
        })
    
    await request(app)
        .put(`/api/deals/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Jordan sneakers',
            price: 700
        })
        .expect(200)
    
    const dealResponse = await request(app)
        .get(`/api/deals/${response.body.id}`)
    expect(dealResponse.body.title).toEqual('Jordan sneakers')
    expect(dealResponse.body.price).toEqual(700)
})

it('publishes an event', async () => {
    const cookie = global.signin()
    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', cookie)
        .send({
            title: 'Grey Jeans',
            price: 251
        })

    await request(app)
        .put(`/api/deals/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Jordan sneakers',
            price: 700
        })
        .expect(200)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})