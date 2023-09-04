import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
// import StarRating from "./StarRating";

// function Test(){
//   const [rating, setRating] = useState(0)
//   return <div>
//     <StarRating color="pink" onRating ={setRating}>

//     </StarRating>
//     <p>The movie was rated {rating}</p>
//   </div>
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />

    {/* <StarRating
      maxRating={5}
      messages={["Not coming back", "Subpar", "Will do", "Cool", "Sheeeesh"]}
      defaultRating = {3}
    />
    <StarRating color="green" className="text" />
    <Test /> */}
  </React.StrictMode>
);
