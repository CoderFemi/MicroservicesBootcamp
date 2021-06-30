import { useState } from "react"
import Router from 'next/router'
import useRequest from "../../hooks/use-request"

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email,
            password
        },
        onSuccess: () => Router.push('/')
    })
    
    const onSubmit = async (event) => {
        event.preventDefault()
        doRequest().then(data => console.log(data))
        setEmail('')
        setPassword('')
    }
    return (
        <form className="w-50 m-auto" onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            {errors}
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" />
            </div>
            <button className="btn btn-primary">Sign Up</button>
        </form>
    )
}

export default Signup