import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'beaver@gmail.com',
            password: 'password'
        })
        .expect(201)
})

it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'invalidemail',
            password: 'password'
        })
        .expect(400)
})

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@gmail.com',
            password: 'p'
        })
        .expect(400)
})

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "testing@hotmail.com"
        })
        .expect(400)
    
    return request(app)
        .post('/api/users/signup')
        .send({
            password: "pass123"
        })
        .expect(400)
})

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@mail.com',
            password: 'pass1234'
        })
        .expect(201)
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@mail.com',
            password: 'pass1234'
        })
        .expect(400)
})

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'johnson@mail.com',
            password: 'pass1234'
        })
        .expect(201)
    expect(response.get('Set-Cookie')).toBeDefined()
})