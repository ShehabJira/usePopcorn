// Custom Hook
import { useState, useEffect } from "react";
const KEY = "16b02cee";
// Custom Hook a function that should contain at least one react hook, otherwise it's a regular function(we are using 4 hooks in here), and return their needed values. (it can take arguments like javascript functions)
// Jonas likes to export components as default exports, and custom hooks as names exports.
export function useMovies(query) {
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	// You can use event handler function for the search bar to do the same of this next effect, but this is just for learning.
	// Always use event handlers instead of effect whenever possible!
	useEffect(
		function () {
			const controller = new AbortController(); // this is from browser API.(A controller object that allows you to abort one or more DOM requests as and when desired.)
			async function fetchMovies() {
				try {
					//while you are trying, if there are any errors may occur, through them to catch.
					setIsLoading(true);
					setError(""); // reset the error each time this function is called. to prevent catch from taking the previous error and print it.
					const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal });
					// throw an error if fetching failed.
					if (!res.ok) throw new Error("Something went wrong with fetching movies");
					const data = await res.json();
					// throw an error if data is not found.
					if (data.Response === "False")
						// R and F are capital.
						throw new Error("Movie not found");
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
	return { movies, isLoading, error };
	// we could retun array as well, but the returnings are different types so object is better.
}
