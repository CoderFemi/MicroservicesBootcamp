import Link from 'next/link'

const Header = ({ currentUser }) => (
    <nav className="navbar navbar-light bg-light mb-5">
        <div className="container-fluid">
            <Link href="/">
                <a className="navbar-brand mb-0 h1">ClosetSweep</a>
            </Link>
            {
                currentUser
                    ?   <Link href="/auth/signout">
                            <a className="nav-link">Sign Out</a>
                        </Link>
                    :
                        <div className="nav d-flex align-items-center">
                            <Link href="/auth/signup">
                                <a className="nav-link">Sign Up</a>
                            </Link>
                            <Link href="/auth/signin">
                                <a className="nav-link">Sign In</a>
                            </Link>
                        </div>
            }
        </div>
    </nav>
)

export default Header