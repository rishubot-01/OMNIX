import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">The page you are looking for does not exist.</p>
      <Link to="/" className="follow-button">
        Back to home
      </Link>
    </main>
  );
}

export default NotFound;
