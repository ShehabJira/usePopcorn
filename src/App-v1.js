import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
// const tempMovieData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt0133093",
//         Title: "The Matrix",
//         Year: "1999",
//         Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt6751668",
//         Title: "Parasite",
//         Year: "2019",
//         Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//     },
// ];

// const tempWatchedData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//         runtime: 148,
//         imdbRating: 8.8,
//         userRating: 10,
//     },
//     {
//         imdbID: "tt0088763",
//         Title: "Back to the Future",
//         Year: "1985",
//         Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//         runtime: 116,
//         imdbRating: 8.5,
//         userRating: 9,
//     },
// ];

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "16b02cee"; //Is put outside the funtion to not be redeclared with each rerendering.
export default function App() {
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	// Retrieve data from local Storage.
	const [watched, setWatched] = useState(function () {
		const stored = JSON.parse(localStorage.getItem("watched"));
		return stored;
	}); // You can 'pass' callback function(pure and doesn't take any args) to be the initial value of state(called only on initial render)(lazy evaluation) but you cannot 'call' a function just like this:
	// useState(localStorage.getItem("watched")) => Cuz React will call this on each render.

	// Note! YOU SHOULDN'T SET STATES IN HERE. (RENDER LOGIC) (INFINITE RENDERING) (first rendering will fetch data, then will setState, setting the state cause a new rerendering, then fetch data again, then setState, then new rerendering,...)
	// You can only set state in event handlers functions or in useEffect in render logic. as useEffect give us a place where we can safely write side effects.
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
	useEffect(
		function () {
			localStorage.setItem("watched", JSON.stringify(watched));
			// Here we just use the watched directly as the effect won't add it to localStorage till a new update happens to it.
			// Whether we added or deleted a movie from watched, this effect will put the updated watched to the localStorage, unlike if we define it outside the effect, we will need to define localStorage for the deletion and addition changes.
		},
		[watched]
	);

	// You can use event handle function for the search bar to do the same of this next effect, but this is just for learning.
	// Always use event handlers instead of effect whenever possible!
	useEffect(
		function () {
			const controller = new AbortController(); // this is from browser API.(A controller object that allows you to abort one or more DOM requests as and when desired.)
			async function fetchMovies() {
				try {
					//while you are trying, if there are any errors may occur, through them to catch.
					setIsLoading(true);
					setError(""); // reset the error each time this function is called. to prevent catch from taking the previous error and print it.
					const res = await fetch(
						`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
						{ signal: controller.signal }
					);
					// throw an error if fetching failed.
					if (!res.ok)
						throw new Error("Something went wrong with fetching movies");
					//JavaScript will actually create an Error object with two properties: name and message.

					const data = await res.json();
					// throw an error if data is not found.
					if (data.Response === "False") throw new Error("Movie not found");

					setMovies(data.Search);
					setError(""); // we need to reset it after the movies has been set.
				} catch (err) {
					if (err.name !== "AbortError") setError(err.message);
				} finally {
					setIsLoading(false); //if it fetching succeeded or an error occured, both ways we need to set the loading to false in the end.
				}
			}
			if (query.length < 2) {
				setMovies([]);
				setError("");
				return;
			}
			fetchMovies();
			return function () {
				controller.abort();
			}; // clean up function (before effect is executed again, it will abort(cancel) the previous fetch request)
			// Note! With each cancel(abort) javascript will throw an error. that the user aborted a request. We need to catch any other error except for that one.
		},
		[query] //Note! Each char you type will make a new request! And race condition will happen. each one will slower the other one. Moreover, each one has a size, if you continued to make more request this will load a big data to your site.
	);
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
	useEffect(
		function () {
			function callBack(e) {
				if (e.code === "Enter") {
					// activeElement => the focused element in the document.
					if (document.activeElement === inputEl.current) return; // to not remove what the user is typing now.
					inputEl.current.focus(); // if Enter is pressed focus on the element and clear its query.
					setQuery("");
				}
			}
			document.addEventListener("keydown", callBack);
			// Clean Up function
			return () => {
				document.removeEventListener("keydown", callBack);
			};
		},
		[setQuery]
	);
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

	useEffect(
		function () {
			// useEffect here is called an Escape Hatch (as it's away of escaping having to write all the code using the react way)
			// Since dealing with dom is considered a side effect. we can't type it in render logic.
			function callBack(e) {
				if (e.code === "Escape") {
					//the code of the key press
					onCloseMovie();
					// console.log("closing");
				}
			}
			document.addEventListener("keydown", callBack);
			// Note! each time new MovieDetails components mounts, a new event listener is added to the document. (an additional one to the one we already have) (this is because each time this effect is executed it will add one more event listener to the document, we don't want that, so we need to clean up this effect)

			return function () {
				document.removeEventListener("keydown", callBack);
			};
		},
		[onCloseMovie]
	); // just to remove the warning.

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
