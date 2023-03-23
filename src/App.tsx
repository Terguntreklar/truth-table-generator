import React, { useState } from "react";
import "./App.css";
import { TruthTable } from "./TruthTable";
function App(): React.ReactElement | null {
  const [errorMsg, setErrorMsg] = useState(<></>);
  const [equation, setEquation] = useState("");
  const [validEquation, setValidEqn] = useState(false);
  const editState = (err: JSX.Element, valid: boolean): void => {
    setErrorMsg(err);
    setValidEqn(valid);
  };
  const specifyErrorMsg = (err: JSX.Element): void => {
    editState(err, false);
  };
  const hasInvalidParens = (str: string): boolean => {
    const stack: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const token = str[i];
      if (token === "(") stack.push(token);
      if (token === ")") {
        if (stack.length > 0) stack.pop();
        else {
          return true;
        }
      }
    }
    if (stack.length > 0) {
      return true;
    }
    return false;
  };
  const validateEquation = (equation: string): boolean => {
    equation = equation.toLowerCase();
    equation = equation.trim();
    if (equation.length === 0) {
      specifyErrorMsg(<></>);
      return false;
    }
    if (hasInvalidParens(equation)) {
      specifyErrorMsg(
        <p>
          this equation has improper{" "}
          <span className="highlight">parentheses</span>
        </p>
      );
      return false;
    }
    const regex = /[a-z]/g;
    if (!regex.test(equation)) {
      specifyErrorMsg(
        <p>
          this equation has no<span className="highlight"> characters</span>
        </p>
      );
      return false;
    }
    {
      // todo:: put the eniter function into this block
      const symbols = ["!", "&", "|"];
      const ignore = [" ", "(", ")"];
      let lastType = "";
      let eq = equation
        .replaceAll("and", "&")
        .replaceAll("or", "|")
        .replaceAll("&&", "&")
        .replaceAll("||", "|");

      for (const [index, token] of [...eq].entries()) {
        if (ignore.includes(token)) continue;
        else if (symbols.includes(token)) {
          // handle !
          if (token === "!") {
            if (lastType === "ch") {
              const g = eq.slice(0, index);
              const h = eq.slice(index + 1);
              specifyErrorMsg(
                <p>
                  {g} <span className="highlight">{eq[index]}</span> {h}
                  <span className="highlight">{` (Operation shouldn't be here) `}</span>
                </p>
              );
              return false;
            }
          }
          // handle | & &
          else if (lastType === "op") {
            const g = eq.slice(0, index);
            const h = eq.slice(index + 1);
            specifyErrorMsg(
              <p>
                {g} <span className="highlight">{eq[index]}</span> {h}
                <span className="highlight">{` (Operation shouldn't be here) `}</span>
              </p>
            );
            return false;
          }
          lastType = "op";
        } else if (/[A-Z]/i.test(token)) {
          if (lastType === "ch") {
            const g = eq.slice(0, index);
            const h = eq.slice(index + 1);
            specifyErrorMsg(
              <p>
                {g} <span className="highlight">{eq[index]}</span> {h}
                <span className="highlight">{` (character shouldn't be here) `}</span>
              </p>
            );
            return false;
          }
          lastType = "ch";
        } else {
          // Any other character
          const g = eq.slice(0, index);
          const h = eq.slice(index + 1);
          specifyErrorMsg(
            <p>
              {g} <span className="highlight">{eq[index]}</span> {h}
              <span className="highlight">{` (character shouldn't be here) `}</span>
            </p>
          );
          return false;
        }
      }
      if (lastType === "op") {
        eq = eq + "<- Equations must end with a variable or a bracket";
        specifyErrorMsg(
          <p>
            this equation has to
            <span className="highlight"> end with a variable or bracket</span>
          </p>
        );
        return false;
      }
    }
    setValidEqn(true);
    return true;
  };
  return (
    <div className="App">
      <header className="App-header">
        <p className="main-title">Enter Logical Expression:</p>
        <p className={validEquation ? "hidden-paragraph" : "error-paragraph"}>
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
