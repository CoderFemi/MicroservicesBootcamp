import { useState } from "react"
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const NewDeal = () => {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const { doRequest, errors } = useRequest({
        url: '/api/deals',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: () => Router.push('/')
    })
    const onSubmit = (event) => {
        event.preventDefault()
        doRequest()
        setTitle('')
        setPrice('')
    }
    const onBlur = () => {
        const value = parseFloat(price)
        if (isNaN(value)) {
            return
        }
        setPrice(value.toFixed(2))
    }
    return (
        <div>
            <h1>Create a Deal</h1>
            {errors}
            <form className="w-lg-50" onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        className="form-control"
                        id="title"
                        value={title}
                        onBlur={onBlur}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        className="form-control"
                        id="price"
                        value={price}
                        onBlur={onBlur}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary">Submit</button>
            </form>
        </div >
    )
}

export default NewDeal