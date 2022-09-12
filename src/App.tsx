import React, { useRef, useState } from "react";
import "./App.css";
import { TruthTable } from "./TruthTable";
function App() {
  const [errorMsg, setErrorMsg] = useState("none");
  const [equation, setEquation] = useState("");
  const [validEquation, setValidEqn] = useState(false);
  const validateEquation = (equation: string) => {
    equation = equation.trim().replaceAll(" ", "");
    equation = equation.toLowerCase();
    let regex = /[2-9]/g;
    //empty equation
    if (!equation) {
      setErrorMsg("none");
      setValidEqn(false);
      return false;
    }
    if (regex.test(equation)) {
      setErrorMsg("digits from 2-9 aren't allowed");
      setValidEqn(false);
      return false;
    }
    //unclosed bracket
    let stack: string[] = [];
    for (let i = 0; i < equation.length; i++) {
      const token = equation[i];
      if (token == "(") stack.push(token);
      if (token == ")") {
        try {
          stack.pop();
        } catch (error) {
          setErrorMsg("Improper parenthesses");
          setValidEqn(false);
          return false;
        }
      }
    }
    if (stack.length) {
      setErrorMsg("Improper parenthesses");
      setValidEqn(false);
      return false;
    }
    regex=/[a-z]/g
    if (!regex.test(equation)) {
      setErrorMsg("no characters in equation");
      setValidEqn(false);
      return false;
    }
    setErrorMsg("none")
    setValidEqn(true)
    return true
  };
  return (
    <div className="App">
      <header className="App-header">
        <p>Enter Logical Expression:</p>
        <p
          className={
            errorMsg == "none" ? "hidden-paragraph" : "error-paragraph"
          }
        >
          {errorMsg}
        </p>
        <input
          type="text"
          spellCheck="false"
          onChange={(e) => {
            validateEquation(e.target.value);
            setEquation(e.target.value);
          }}
        />
        {validEquation ? <TruthTable equation={equation} /> : <></>}
      </header>
    </div>
  );
}

export default App;
