import request from 'supertest'
import { app } from '../../app'

it('has a route handler listening to /api/auctions for post requests', async () => {
    const response = await request(app)
        .post('/api/auctions')
        .send({})
    expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
    
})

it('does not return a status of 401 if the user is signed in', async () => {

})

it('returns an error if an invalid auction title is provided', async () => {

})

it('returns an error if an invalid auction price is provided', async () => {

})

it('creates an auction with valid inputs', async () => {

})