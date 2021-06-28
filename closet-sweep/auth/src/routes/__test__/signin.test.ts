import request from 'supertest'
import { app } from '../../app'

it('fails when non-existing email is supplied', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'beaver@gmail.com',
            password: 'password'
        })
        .expect(400)
})

it('returns a 400 with an invalid password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@gmail.com',
            password: 'pass1234'
        })
        .expect(201)
    
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'johnson@gmail.com',
            password: 'pas54846546'
        })
        .expect(400)
})

it('sets a cookie after successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@gmail.com',
            password: 'pass1234'
        })
        .expect(201)
    
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'johnson@gmail.com',
            password: 'pass1234'
        })
        .expect(200)
    expect(response.get('Set-Cookie')).toBeDefined()
})