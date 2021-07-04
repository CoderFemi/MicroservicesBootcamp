import request from 'supertest'
import { app } from '../../app'

const createDeal = () => {
     return request(app)
        .post('/api/deals')
        .set('Cookie', global.signin())
        .send({
            title: 'Lawn mower',
            price: 125
        })
}
it('can fetch a list of deals', async () => {
    await createDeal()
    await createDeal()
    await createDeal()

    const response = await request(app)
        .get('/api/deals')
        .expect(200)
    expect(response.body.length).toEqual(3)
})