import React from "react";
import "./TruthTable.css";
interface truthTableProps {
  equation: string;
}

export const TruthTable: React.FC<truthTableProps> = (prop) => {
  const equationCleanup = (equation: string): string => {
    let formattedEquation = equation
      .trim()
      .toLowerCase()
      .replaceAll("and", "&")
      .replaceAll("or", "|")
      .replaceAll("&&", "&")
      .replaceAll("||", "|")
      .replaceAll(" ", "");
    return formattedEquation;
  };
  const getVars = (equation: string): string[] => {
    let holder = [...new Set(equation)].join();
    let vars = holder.match(/[a-z]/g);
    return vars || [""];
  };

  const getBoolArr = (numVars: number): boolean[][] => {
    let length = 2 ** numVars;
    let boolArr: boolean[][] = [];
    for (let i = 0; i < length; i++) {
      let bin = i
        .toString(2)
        .split("")
        .map((e) => parseInt(e));
      while (bin.length < numVars) {
        bin.unshift(0);
      }
      let bools = bin.map((e) => !!e);
      boolArr.push(bools);
    }
    return boolArr;
  };

  const assignCharToBool = (
    vars: string[],
    boolArr: boolean[][]
  ): Map<string, boolean[]> => {
    let charMap = new Map<string, boolean[]>();
    vars.map((e, i) => {
      let placeHolder = boolArr.map((e) => e[i]); //gets a column of truth values to assign to a character
      charMap.set(e, placeHolder);
    });
    return charMap;
  };

  const infixtopostfix = (equation: string) => {
    var symbols = ["|", "&", "!"];
    var opStack: string[] = [];
    var postFix: string[] = [];
    for (let i = 0; i < equation.length; i++) {
      const token = equation[i];
      if (!symbols.includes(token) && !["(", ")"].includes(token)) {
        postFix.push(token);
        continue;
      }
      let topOfStack = opStack[opStack.length - 1];
      if (token == "(") {
        opStack.push(token);
        continue;
      }
      if (token == ")") {
        while (opStack.length) {
          let op = opStack.pop();
          if (op === "(") break;
          postFix.push(op!);
        }
        continue;
      }
      if (!opStack.length || topOfStack == "(") {
        opStack.push(token);
        continue;
      }
      let prevPresedence = symbols.indexOf(topOfStack),
        currPresedence = symbols.indexOf(token);
      while (currPresedence < prevPresedence) {
        var op = opStack.pop();
        postFix.push(op!); //trust me bro, it's not null bro
        prevPresedence = symbols.indexOf(opStack[opStack.length - 1]);
      }
      opStack.push(token);
    }
    while (opStack.length) {
      var op = opStack.pop();
      if (op == "(") break;
      postFix.push(op!);
    }
    return postFix;
  };
  const calculateTable = (
    equation: string,
    vars: string[],
    boolsArrs: boolean[][],
    stack: string[],
    charMap: Map<string, boolean[]>
  ) => {
    let symbols = ["&", "|", "!"];
    let result: boolean[][] = [];
    for (let i = 0; i < 2 ** vars.length; i++) {
      result.push([]);
      let tempStack = stack.slice().reverse(); //hacky way of making a copy of an array, arr.concat() is also hacky
      //reversed to avoid using the unshift() function, there's probably a better way
      while (tempStack.length != 0) {
        if (!symbols.includes(tempStack[tempStack.length - 1])) {
          //TODO:: wrong char
          result[i].push(charMap.get(tempStack.pop()!)![i]);
          continue;
        }
        if (symbols.includes(tempStack[tempStack.length - 1])) {
          let x = result[i].pop()!;
          let y: boolean;
          switch (tempStack[tempStack.length - 1]) {
            case "&":
              y = result[i].pop()!;
              if (y === undefined) {
                console.log("horrid");
              } else result[i].push(x && y);
              break;
            case "|":
              y = result[i].pop()!;
              result[i].push(x || y);
              break;
            default: //"!"
              x = !x;
              result[i].push(x);
              console.log(x);
              break;
          }
          tempStack.pop();
          continue;
        }
        tempStack.pop();
      }
    }
    return result;
  };
  const truthArray = (equation: string) => {
    let stack = infixtopostfix(equation);
    let vars = getVars(equation); // vars won't be undefined since App.tsx wouldn't allow it
    let boolsArrs = getBoolArr(vars.length);
    let charMap: Map<string, boolean[]> = assignCharToBool(vars!, boolsArrs);
    let result = calculateTable(
      equation,
      vars,
      boolsArrs,
      stack,
      charMap,
    );
    let len: number = 2 ** vars.length;
    let truthArr: JSX.Element[][] = [];
    for (let i = 0; i < len; i++) {
      truthArr.push([]);
      charMap.forEach((elem) =>
        truthArr[i].push(<td>{elem[i].toString()}</td>)
      );
      try {
        //TODO:: REMOVE THIS
        truthArr[i].push(<td>{result[i][0].toString()}</td>);
      } catch (err) {
        console.log("lmfao");
      }
    }
    return truthArr.map((e) => <tr>{e}</tr>);
  };
  let formattedEquation = equationCleanup(prop.equation);
  return (
    <table>
      <thead>
        {getVars(formattedEquation).map((e) => (
          <td>{e}</td> //should be only one <tr> child here
        ))}
        <td>result</td>
      </thead>
      <tbody>{truthArray(formattedEquation)}</tbody>
    </table>
  );
};
