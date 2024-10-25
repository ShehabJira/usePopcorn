// This File Is For Custom Hooks
import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies"; // useMovies is inside a curly braces as it is a named export.
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "16b02cee"; //Is put outside the funtion to not be redeclared with each rerendering.
export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	// Custom Hook
	const { movies, isLoading, error } = useMovies(query);
	// Retrieve from local storage
	// const [watched, setWatched] = useState(function () {
	//     const stored = JSON.parse(localStorage.getItem("watched"));
	//     return stored;
	// });

	// Custom Hook
	const [watched, setWatched] = useLocalStorageState([], "watched"); // this custom hook give me a useState and will store and retrieve state data into localStorage to this state. it takes the initialState of this state that the user want, and the key which you want the data to be stored as in the localStorage.
	function handleSelectMovie(id) {
		setSelectedId((selectedId) => (selectedId === id ? null : id));
	}
	function handleCloseMovie() {
		setSelectedId(null);
	}
	function handleAddWatched(watchedMovie) {
		setWatched((watched) => [...watched, watchedMovie]);
		// localStorage.setItem("watched",JSON.stringify([...watched, watchedMovie]));
		// Note! we cannot use the watched directly after setWatched(), because watched currently is a stale state.
		// If we deleted a movie from the watched, we need to update that in the localStorage.

		// So, use effect instead. Whenever the watched is updated, it puts it to localStorage.
	}
	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	// Add watched movies to localStorage
	// useEffect(
	//     function () {
	//         localStorage.setItem("watched", JSON.stringify(watched));
	//         // Here we just use the watched directly as the effect won't add it to localStorage till a new update happens to it.
	//         // Whether we added or deleted a movie from watched, this effect will put the updated watched to the localStorage, unlike if we define it outside the effect, we will need to define localStorage for the deletion and addition changes.
	//     },
	//     [watched]
	// );

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{isLoading && <Loader />}
					{error && <ErrorMessage errMessage={error} />}
					{!isLoading && !error && (
						<MovieList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}
function Loader() {
	return <p className="loader">Loading...</p>;
}
function ErrorMessage({ errMessage }) {
	return (
		<p className="error">
			<span>⛔</span> {errMessage}
		</p>
	);
}

function NavBar({ children }) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
}
function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}
function Search({ query, setQuery }) {
	let inputEl = useRef(null); // as long as you will use it with DOM, set intial to null.
	/* Note!
    useEffect(function () {
        const el = document.querySelector(".search");
        el.focus();
    }, []);
    // this way is not good, this is not the react way of selecting DOM elements!
    // we shouldn't use the classNames to select them.
    */
	//             focusing on search bar while presing Enter.

	// Custom Hook
	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;
		inputEl.current.focus();
		setQuery("");
	});
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
		/>
	);
}
function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>movies={movies.length}</strong> results
		</p>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}
function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>

			{isOpen && children}
		</div>
	);
}

function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}
function Movie({ movie, onSelectMovie }) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
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
}
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");
	const countRef = useRef(0); // Note! we cannot update Ref in render logic, so use effect.
	let count = 0; // it will be reset to 0 in each re-render as it's not persistent at renders. Unlike Ref it persists.
	/* Note!
        State => persists across renders and trigger a rerender.
        Ref   => persists across renders but it doesn't trigger a rerender when it gets updated(so that we don't use it in the JSX output).
        Vars  => don't persist and don't trigger a rerender when it's updated. 
     */
	useEffect(
		function () {
			// Each time userRating change, update our Ref
			if (userRating) countRef.current++; // this condition to prevent the countRef to be increased in the first mount of the component.
			if (userRating) count++; // see the difference between this var and ref.
			// you can also put each number in an array.
			// Note! changing Ref doesn't make a re-render.
			// Note! We use Ref when we do not to show this value on the UI.
		},
		[userRating, count]
	);
	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;
	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAdding() {
		const newWatchedMovie = {
			imdbID: selectedId,
			poster,
			title,
			year,
			userRating,
			countRatingDecisions: countRef.current,
			countVar: count, // will reach only at 1 and never more. as count resets in each rerender to 0;
			imdbRating: Number(imdbRating),
			runtime: parseInt(runtime), //Number(runtime.split(" ").at(0))
		};
		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}
	// Custom Hook
	useKey("Escape", onCloseMovie);
	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
				);
				const data = await res.json();
				setMovie(data);
				setIsLoading(false);
			}
			getMovieDetails();
		},
		[selectedId]
	); //there is no need to clean up here. as we only send a new request if we select a movie. and this considered normal. not like the query character.

	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;
			//clean up function. (is done [1] after a component instance has umounted and [2] before the effect is executed again(between rerendering)
			/*Note!
                clean up function is necessary whenever the side effect keeps happening after
                the component has been re-rendered or unmounted.
                
                Note! When you do an HTTP request in your effect, and if the component
                is re-rendered while the first request is still running, a new second
                request would be fired off. This creates a bug called a race condition. 
                So it's a good idea to cancel the request in a clean up function.

                ex.
                # Effect               # Potential Cleanup
                HTTP Request       =>  Cancel Request
                API Subscription   =>  Cancel Subscription
                Start Timer        =>  Stop Timer
                Add Event Listener =>  Remove Event Listener
                */
			return function () {
				document.title = "usePopcorn";
				// console.log(`you have left ${title}`);
			};
		},
		[title]
	);
	/*Note!
        Each Effect should do only one thing! 
        Use one useEffect hook for each side effect.
        This makes effects easier to clean up.
    */

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${title} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span>
								{imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{isWatched === false ? (
								<>
									<StarRating
										maxRating={10}
										size={24}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdding}>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You've already rated this movie with {watchedUserRating} ⭐
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}
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
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed(2)} min</span>
				</p>
			</div>
		</div>
	);
}
function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<WatchedMovie
					movie={movie}
					key={movie.imdbID}
					onDeleteWatched={onDeleteWatched}
				/>
			))}
		</ul>
	);
}
function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
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
				<button
					className="btn-delete"
					onClick={() => onDeleteWatched(movie.imdbID)}
				>
					X
				</button>
			</div>
		</li>
	);
}
