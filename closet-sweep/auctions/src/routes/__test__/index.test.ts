import request from 'supertest'
import { app } from '../../app'

const createAuction = () => {
     return request(app)
        .post('/api/auctions')
        .set('Cookie', global.signin())
        .send({
            title: 'Lawn mower',
            price: 125
        })
}
it('can fetch a list of auctions', async () => {
    await createAuction()
    await createAuction()
    await createAuction()

    const response = await request(app)
        .get('/api/auctions')
        .expect(200)
    expect(response.body.length).toEqual(3)
})