import React from "react";
import ReactDOM from "react-dom";

import USMap from "./USMap";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <USMap />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
