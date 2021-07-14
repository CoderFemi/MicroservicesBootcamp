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
            <table className="table w-50">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{deal.title}</td>
                        <td>{deal.price}</td>
                    </tr>
                </tbody>
            </table>
            <button onClick={() => doRequest()} className="btn btn-primary">Purchase</button>
        </div>
    )
}

DealShow.getInitialProps = async (context, client) => {
    const { dealId } = context.query
    const { data } = await client.get(`/api/deals/${dealId}`)
    return { deal: data }
}

export default DealShow