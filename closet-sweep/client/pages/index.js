import Link from "next/link"

const LandingPage = ({ currentUser, deals }) => {
    const dealList = deals.map(deal => {
        return (
            <tr key={deal.id}>
                <td>{ deal.title }</td>
                <td>{deal.price}</td>
                <td>
                    <Link href="/deals/[dealId]" as={`/deals/${deal.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        )
    })
    return (
        <div>
            <h2>Deals Available</h2>
            <table className="table table-striped table-hover w-50">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {dealList}
                </tbody>
            </table>
        </div>
    )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/deals')
    return { deals: data }
}

export default LandingPage