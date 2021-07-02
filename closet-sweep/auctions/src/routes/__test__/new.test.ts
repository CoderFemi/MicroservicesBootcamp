import request from 'supertest'
import { app } from '../../app'
import { Auction } from '../../../models/auction'

it('has a route handler listening to /api/auctions for post requests', async () => {
    const response = await request(app)
        .post('/api/auctions')
        .send({})
    expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/auctions')
        .send({})
})

it('does not return a status of 401 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send({})
    expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid auction title is provided', async () => {
    await request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 200
        })
        .expect(400)
    
})

it('returns an error if an invalid auction price is provided', async () => {
    await request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send({
            title: 'title',
            price: true
        })
        .expect(400)
})

it('creates an auction with valid inputs', async () => {
    let auctions = await Auction.find({})
    expect(auctions.length).toEqual(0)
    const newAuction = {
        title: 'title',
        price: 250,
    }
    await request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send(newAuction)
        .expect(201)
    auctions = await Auction.find({})
    expect(auctions.length).toEqual(1)
    expect(auctions[0].price).toEqual(newAuction.price)
    expect(auctions[0].title).toEqual(newAuction.title)
})