/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import "./TruthTable.css";
interface truthTableProps {
  equation: string;
}

export const TruthTable: React.FC<truthTableProps> = (prop) => {
  const equationCleanup = (equation: string): string => {
    const formattedEquation = equation
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
    const holder = [...new Set(equation)].join();
    const vars = holder.match(/[a-z]/g);
    if (vars != null) return vars;
    return [""];
  };

  const getBoolArr = (numVars: number): boolean[][] => {
    const length = 2 ** numVars;
    const boolArr: boolean[][] = [];
    for (let i = 0; i < length; i++) {
      const bin = i
        .toString(2)
        .split("")
        .map((e) => parseInt(e));
      while (bin.length < numVars) {
        bin.unshift(0);
      }
      const bools = bin.map((e) => Boolean(e));
      boolArr.push(bools);
    }
    return boolArr;
  };

  const assignCharToBool = (
    vars: string[],
    boolArr: boolean[][]
  ): Map<string, boolean[]> => {
    const charMap = new Map<string, boolean[]>();
    vars.forEach((e, i) => {
      const placeHolder = boolArr.map((e) => e[i]); // gets a column of truth values to assign to a character
      charMap.set(e, placeHolder);
    });
    return charMap;
  };

  const infixtopostfix = (equation: string): string[] => {
    const symbols = ["|", "&", "!"];
    const opStack: string[] = [];
    const postFix: string[] = [];
    for (let i = 0; i < equation.length; i++) {
      const token = equation[i];
      if (!symbols.includes(token) && !["(", ")"].includes(token)) {
        postFix.push(token);
        continue;
      }
      const topOfStack = opStack[opStack.length - 1];
      if (token === "(") {
        opStack.push(token);
        continue;
      }
      if (token === ")") {
        while (opStack.length > 0) {
          const op = opStack.pop()!;
          if (op === "(") break;
          postFix.push(op);
        }
        continue;
      }
      if (opStack.length === 0 || topOfStack === "(") {
        opStack.push(token);
        continue;
      }
      let prevPresedence = symbols.indexOf(topOfStack);
      const currPresedence = symbols.indexOf(token);
      while (currPresedence < prevPresedence) {
        const op = opStack.pop()!;
        postFix.push(op); // trust me bro, it's not null bro
        prevPresedence = symbols.indexOf(opStack[opStack.length - 1]);
      }
      opStack.push(token);
    }
    while (opStack.length > 0) {
      const op = opStack.pop()!;

      if (op === "(") break;
      postFix.push(op);
    }
    return postFix;
  };
  const calculateTable = (
    equation: string,
    vars: string[],
    boolsArrs: boolean[][],
    stack: string[],
    charMap: Map<string, boolean[]>
  ): boolean[][] => {
    const symbols = ["&", "|", "!"];
    const result: boolean[][] = [];
    for (let i = 0; i < 2 ** vars.length; i++) {
      result.push([]);
      const tempStack = [...stack].reverse();
      while (tempStack.length !== 0) {
        if (!symbols.includes(tempStack[tempStack.length - 1])) {
          // TODO:: wrong char
          const currentCharacter: string = tempStack[tempStack.length - 1];
          result[i].push(charMap.get(currentCharacter)![i]);
          tempStack.pop();
          continue;
        }
        if (symbols.includes(tempStack[tempStack.length - 1])) {
          let x = result[i].pop()!;
          let y: boolean;
          switch (tempStack[tempStack.length - 1]) {
            case "&":
              y = result[i].pop()!;
              result[i].push(x && y);
              break;
            case "|":
              y = result[i].pop()!;
              result[i].push(x || y);
              break;
            default: // "!"
              x = !x;
              result[i].push(x);
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
  const truthArray = (equation: string): any => {
    const stack = infixtopostfix(equation);
    const vars = getVars(equation); // vars won't be undefined since App.tsx wouldn't allow it
    const boolsArrs = getBoolArr(vars.length);
    const charMap: Map<string, boolean[]> = assignCharToBool(vars, boolsArrs);
    const result = calculateTable(equation, vars, boolsArrs, stack, charMap);
    const len: number = 2 ** vars.length;
    const truthArr: JSX.Element[][] = [];
    for (let i = 0; i < len; i++) {
      truthArr.push([]);
      charMap.forEach((elem) =>
        truthArr[i].push(<td>{elem[i].toString()}</td>)
      );
      truthArr[i].push(<td>{result[i][0].toString()}</td>);
    }
    return truthArr.map((e) => <tr key={1}>{e}</tr>);
  };
  const formattedEquation = equationCleanup(prop.equation);
  return (
    <table>
      <thead>
        {getVars(formattedEquation).map((e, i) => (
          <td key={i}>{e}</td> // should be only one <tr> child here
        ))}
        <td>result</td>
      </thead>
      <tbody>{truthArray(formattedEquation)}</tbody>
    </table>
  );
};
