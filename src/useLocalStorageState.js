// Custom Hook (a special state hook that will be synchronized with localStorage)
// [1] we will just return a useState hook, but if there is any data that is stored in the
// localStorage to that state we will add it to the initial state value else we will initial
// this state with the initialState the user gave.
// [2] we will store any data of this state to the localStorage.

import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
	// Retrieve from local storage
	const [value, setValue] = useState(function () {
		const stored = JSON.parse(localStorage.getItem(key));
		return stored ? stored : initialState;
		// if the stored has something return it else(it's empty) return initialState which is []
	});

	// Add watched movies to localStorage
	useEffect(
		function () {
			localStorage.setItem(key, JSON.stringify(value));
		},
		[value, key]
	);
	return [value, setValue];
}
