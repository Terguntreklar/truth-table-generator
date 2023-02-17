import React, { useState } from "react";
import "./App.css";
import { TruthTable } from "./TruthTable";
function App() {
  const [errorMsg, setErrorMsg] = useState("empty");
  const [equation, setEquation] = useState("");
  const [validEquation, setValidEqn] = useState(false);
  const editState = (err: string, valid: boolean) => {
    setErrorMsg(err);
    setValidEqn(valid);
  };
  const validateEquation = (equation: string) => {
    equation = equation.toLowerCase();
    equation = equation.trim();
    let regex = /[2-9]/g;
    if (!equation) {
      editState("empty", false);
      return false;
    }
    if (regex.test(equation)) {
      editState("digits from 2-9 aren't allowed", false);
      return false;
    }
    let stack: string[] = [];
    for (let i = 0; i < equation.length; i++) {
      const token = equation[i];
      if (token == "(") stack.push(token);
      if (token == ")") {
        if (stack.length) stack.pop();
        else {
          editState("Improper parentheses", false);
          return false;
        }
      }
    }
    if (stack.length) {
      editState("Improper parentheses", false);
      return false;
    }
    regex = /[a-z]/g;
    if (!regex.test(equation)) {
      editState("no characters in equation", false);
      return false;
    }
    {
      //todo:: put the eniter function into this block
      let symbols = ["!", "&", "|"];
      let ignore = [" ", "(", ")"];
      let lastType = "";
      let eq = equation
        .replaceAll("and", "&")
        .replaceAll("or", "|")
        .replaceAll("&&", "&")
        .replaceAll("||", "|");

      for (let [index, token] of [...eq].entries()) {
        console.log(`on index ${index}, letter = '${token}'
        the last type was ${lastType}`);
        if (ignore.includes(token)) continue;
        else if (symbols.includes(token)) {
          //handle !
          if (token == "!") {
            if (lastType === "ch") {
              let g = eq.split("");
              g.splice(
                index,
                1,
                "( " + token + " <- this operation shouldn't be here)"
              );
              editState(g.join(" "), false);
              return false;
            }
          }
          //handle | & &
          else if (lastType === "op") {
            let g = eq.split("");
            g.splice(
              index,
              1,
              "( " + token + " <- this operation shouldn't be here)"
            );
            editState(g.join(" "), false);
            return false;
          }
          lastType = "op";
        } else if (/[A-Z]/i.test(token)) {
          if (lastType === "ch") {
            let g = eq.split("");
            g.splice(
              index,
              1,
              "( " + token + " <- this character shouldn't be here)"
            );
            console.log(g.join(" "), index);
            editState(g.join(" "), false);
            return false;
          }
          lastType = "ch";
        } else {
          //Any other character
          let g = eq.split("");
          g.splice(
            index,
            1,
            "( " + token + " <- this character shouldn't be here)"
          );
          console.log(g.join(" "), index);
          editState(g.join(" "), false);
          return false;
        }
      }
      if (lastType === "op") {
        eq = eq + "<- Equations must end with a variable or a bracket";
        editState(eq, false);
        return false;
      }
    }
    editState("none", true);
    return true;
  };
  const validateParens = (equation: string): Function => {
    let stack: number = 0;
    let myEquation = equation.split("");
    myEquation.forEach((elem,i) => {
      if (elem === "(") {
        stack++;
      } else if (elem === ")") {
        stack--;
        if (stack <= 0) {
          return dud(i,"this bracket shouldn't be here");
        }
      }
    });
    if (stack === 0) {
       return ()=>dud(-1, "")
    }
    else return ()=>dud(0, "A bracket was opened but not closed");
  };
  const warnNumber = (equation: string): number => {
    let a = /[2-9]/g.exec(equation);
    if (a) {
      return a.index;
    } else return -1;
  };
  const warnAboutChar = (equation: string): number => {
    return 0
  }
  const dud = (a:number,b:string) => {
    return ({
      index: a,
      message: b,
    })
  }
  const warnAbout = (equation: string) => (index: number, message: string) => {
    let g = equation.split("");
    g.splice(index, 1, "( " + equation[index] +` <- ${message})`);
    editState(g.join(" "), false);
  };
  return (
    <div className="App">
      <header className="App-header">
        <p>Enter Logical Expression:</p>
        <p
          className={
            errorMsg === "none" || errorMsg === "empty"
              ? "hidden-paragraph"
              : "error-paragraph"
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
