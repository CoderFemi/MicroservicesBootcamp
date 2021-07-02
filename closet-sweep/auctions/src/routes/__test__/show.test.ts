import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'


it('returns a 404 if auction is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .get(`/api/auctions/${id}`)
        .send()
        .expect(404)
})

it('returns the auction if found', async () => {
    const title = "Kitchen blender"
    const price = 550

    const response = await request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send({
            title, price
        })
        .expect(201)
    
    const auctionResponse = await request(app)
        .get(`/api/auctions/${response.body.id}`)
        .expect(200)
    expect(auctionResponse.body.title).toEqual(title)
    expect(auctionResponse.body.price).toEqual(price)
})