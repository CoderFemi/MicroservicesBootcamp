import { useEffect, useState } from "react"
import useRequest from "../../hooks/use-request"
import StripeCheckout from 'react-stripe-checkout'
import Router from "next/router"

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState('')
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })
    useEffect(() => {
        const findTimeLeft = () => {
            const milliseconds = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(milliseconds / 1000))
        }
        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)
        // if (timeLeft <= 0) {
        //     clearInterval(timerId)
        // }
        return () => {
            clearInterval(timerId)
        }
    }, [])
    return (
        <div>
            <h1>My Order Details</h1>
            {errors}
            <table className="table w-50">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{order.deal.title}</td>
                        <td>{order.deal.price}</td>
                    </tr>
                </tbody>
            </table>
            {
                timeLeft > 0
                    ?   <div className="text-info">
                            <p><strong>Time left to pay: {timeLeft} seconds</strong></p>
                            <StripeCheckout
                                token={({ id }) => doRequest({ token: id })}
                                stripeKey="pk_test_51JCj6ZKzFMtjcQnntQ6zNQqtl0gqSOK2DpINznvTvXuNRvWG9Q7RFYAn6ZmvZ0kPiNaIGmk04Xc6CSHdJ3TkkBgg00ZmKq3sJF"
                                amount={order.deal.price * 100}
                                email={currentUser.email}
                            />
                        </div>
                    :   <div className="text-warning">
                            <strong>Order for {order.deal.title} has expired.</strong>
                        </div>
            }
        </div>
    )
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)
    return { order: data }
}

export default OrderShow