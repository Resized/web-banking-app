import { useEffect } from 'react';
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    useEffect(() => {
        if (isRouteErrorResponse(error) && error.status === 403) {
            navigate('/login');
        }
    }, [error, navigate]);

    return (
        <div id="error-page" className="container text-center mt-5">
            <h1 className="display-3">Oops!</h1>
            <p className="lead">Sorry, an unexpected error has occurred.</p>
            <p className="text-muted">
                <i>{
                    isRouteErrorResponse(error) ? (
                        `${error.status} ${error.statusText}`
                    ) : (
                        error instanceof Error ? error.message : 'An unknown error occurred.'
                    )
                }</i>
            </p>
            {isRouteErrorResponse(error) && error.data && (
                <pre className="bg-light p-3 rounded">
                    <code>{JSON.stringify(error.data, null, 2)}</code>
                </pre>
            )}
            <Link to="/" className="btn btn-primary mt-3">
                Go back to the homepage
            </Link>
        </div>
    );
}
