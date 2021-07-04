import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'


it('returns a 404 if deal is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .get(`/api/deals/${id}`)
        .send()
        .expect(404)
})

it('returns the deal if found', async () => {
    const title = "Kitchen blender"
    const price = 550

    const response = await request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({
            title, price
        })
        .expect(201)
    
    const dealResponse = await request(app)
        .get(`/api/deals/${response.body.id}`)
        .expect(200)
    expect(dealResponse.body.title).toEqual(title)
    expect(dealResponse.body.price).toEqual(price)
})