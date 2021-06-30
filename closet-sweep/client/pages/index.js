import buildClient from "../api/build-client"

const LandingPage = ({ currentUser }) => {

    return (
        <div>
            <h1>This is the Landing Page</h1>
            {
                currentUser
                ? <h3>Welcome, {currentUser.email}!</h3>
                : <h3>You are not signed in.</h3>
            }
        </div>
    )
}

LandingPage.getInitialProps = async (context) => {
    const client = buildClient(context)
    const { data } = await client.get('/api/users/currentuser')
    return data
}

export default LandingPage