import Router from "next/router"
import useRequest from "../../hooks/use-request"

const DealShow = ({ deal }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            dealId: deal.id
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })
    return (
        <div>
            {errors}
            <h1>{deal.title}</h1>
            <h4>{deal.price}</h4>
            <button onClick={doRequest} className="btn btn-primary">Purchase</button>
        </div>
    )
}

DealShow.getInitialProps = async (context, client) => {
    const { dealId } = context.query
    const { data } = await client.get(`/api/deals/${dealId}`)
    return { deal: data }
}

export default DealShow