import ReactDOM from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App";

// import { useState } from "react";
// import StarRating from "./StarRating";

// function Test() {
//     const [movieRating, setMovieRating] = useState();
//     return (
//         <div style={{ margin: "30px auto", width: "400px" }}>
//             <StarRating
//                 color="brown"
//                 maxRating={10}
//                 onSetRating={setMovieRating}
//             />
//             <p>This Movie is rated with {movieRating} stars</p>
//         </div>
//     );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
		{/* <StarRating maxRating={10} />
        <StarRating maxRating={15} defaultRating={7} />
        <StarRating
            maxRating={5}
            color="red"
            size={30}
            className="Test"
            messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
        />
        <StarRating
            maxRating={7}
            messages={[
                "Awful",
                "Terrible",
                "Bad",
                "Not Bad",
                "Okay",
                "Good",
                "Amazing",
            ]}
        />
        <Test /> */}
	</React.StrictMode>
);
