import { useEffect, useState } from "react"
import useRequest from "../../hooks/use-request"

const OrderShow = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState('')
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
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            token: 'tok_visa',
            orderId: order.id
        },
        onSuccess: (paymentId) => console.log(paymentId)
    })
    return (
        <div>
            {errors}
            {
                timeLeft > 0
                    ? <small className="text-info"><strong>Time left to pay: {timeLeft} seconds</strong></small>
                    : <div className="text-warning"><strong>Order for {order.deal.title} has expired.</strong></div>
            }
            <h1>{order.deal.title}</h1>
            <h4>{order.deal.price}</h4>
            <button onClick={doRequest} className="btn btn-primary" disabled={timeLeft <= 0}>Pay</button>
        </div>
    )
}

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)
    return { order: data }
}

export default OrderShow