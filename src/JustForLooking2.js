import { useState } from "react";

const tempMovieData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
	},
	{
		imdbID: "tt0133093",
		Title: "The Matrix",
		Year: "1999",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
	},
	{
		imdbID: "tt6751668",
		Title: "Parasite",
		Year: "2019",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
	},
];

const tempWatchedData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
		runtime: 148,
		imdbRating: 8.8,
		userRating: 10,
	},
	{
		imdbID: "tt0088763",
		Title: "Back to the Future",
		Year: "1985",
		Poster:
			"https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
		runtime: 116,
		imdbRating: 8.5,
		userRating: 9,
	},
];

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
	const [movies, setMovies] = useState(tempMovieData);
	// movies will be prop drilled to NumResults(thru NavBar) and MovieList(thru Main and ListBox).
	// We will solve this by component composition.
	return (
		<>
			<NavBar movies={movies} />
			<Main movies={movies} />
		</>
	);
} // App is a Structural component. [1] "pages", "layouts", or "screens" of the app. [2] Result of composition. [3] It can be huge and non-reusable(but don't have to)

function NavBar({ movies }) {
	return (
		<nav className="nav-bar">
			<Logo />
			<Search />
			<NumResults movies={movies} />
		</nav>
	);
} // NavBar is a Structural component.
function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
} // Logo is stateless/presentational component  => [1] has no state. [2] can receive props and simply present received data or other content. [3] Usually small and reusable.
function Search() {
	const [query, setQuery] = useState("");

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
} // Search is a stateful component. => [1] have state. [2] can still be reusable.
function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>movies={movies.length}</strong> results
		</p>
	);
} // NumResult is a stateless/presentational component.

// We broke up the nav component into small components each one does 1 responsibility.

function Main({ movies }) {
	return (
		<main className="main">
			<ListBox movies={movies} />
			<WatchedBox />
		</main>
	);
} // Main is a Structural component.
function ListBox({ movies }) {
	const [isOpen1, setIsOpen1] = useState(true);

	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen1((open) => !open)}
			>
				{isOpen1 ? "–" : "+"}
			</button>

			{isOpen1 && <MovieList movies={movies} />}
		</div>
	);
} // ListBox is a stateful component.
function MovieList({ movies }) {
	return (
		<ul className="list">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} />
			))}
		</ul>
	);
} // MovieList is a stateful component.
function Movie({ movie }) {
	return (
		<li>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
} // movie is stateless/ presentaional component.
// I make a new separated component 'movie' for MovieList according to my personal preference, as it's just all about the movie that we will loop on it many times.

function WatchedBox() {
	const [watched, setWatched] = useState(tempWatchedData);
	const [isOpen2, setIsOpen2] = useState(true);

	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen2((open) => !open)}
			>
				{isOpen2 ? "–" : "+"}
			</button>
			{isOpen2 && (
				<>
					<WatchedSummary watched={watched} />
					<WatchedMoviesList watched={watched} />
				</>
			)}
		</div>
	);
} // WatchedBox is a stateful component.
function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));
	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
} // WatchedSummary is a presentational component.
function WatchedMoviesList({ watched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie movie={movie} key={movie.imdbID} />
			))}
		</ul>
	);
} // WatchedMoviesList is a presentational component.
function WatchedMovie({ movie }) {
	return (
		<li>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
			</div>
		</li>
	);
} // WatchedMovie is a presentational component.

// We broke up the Main component into 2 components(ListBox and WatchedBox) according to logical separation of content.

/* Note!
    ListBox and WatchedBox are both alike in everything. 
    Except the part which is in the conditional rendering.
    In turn, we could make a reusable component for them and takes children with the 
    different parts.
    We will make it in the App.js
    It's name is box. 
*/
