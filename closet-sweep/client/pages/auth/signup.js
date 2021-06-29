import { useState } from "react"
import axios from "axios"

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState('')
    const onSubmit = async (event) => {
        event.preventDefault()
        setErrors('')
        try {
            const response = await axios.post('/api/users/signup', {
                email,
                password
            })
            console.log('Response:', response.data)
        } catch (error) {
            setErrors(error.response.data.errors)
        }
            
        setEmail('')
        setPassword('')
    }
    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            {errors && 
                <div className="alert alert-danger">
                    <h4>Error encountered...</h4>
                    <ul className="my-0">
                        {errors.map((err, index) => <li key={index}>{err.message}</li>)}
                    </ul>
                </div>
            }
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" />
            </div>
            <button className="btn btn-primary">Sign Up</button>
        </form>
    )
}

export default Signup