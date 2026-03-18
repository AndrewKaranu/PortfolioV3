"use client";

import { useState } from "react";
import { Button, Frame } from "@react95/core";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prev !== null && operator && !waitingForOperand) {
      const result = calculate(parseFloat(prev), current, operator);
      setDisplay(String(result));
      setPrev(String(result));
    } else {
      setPrev(display);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prev === null || operator === null) return;
    const result = calculate(parseFloat(prev), parseFloat(display), operator);
    const resultStr = parseFloat(result.toFixed(10)).toString();
    setDisplay(resultStr);
    setPrev(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const btnStyle = { fontSize: 13, width: "100%", minHeight: 36 };
  const opStyle = { ...btnStyle, color: "#000080", fontWeight: "bold" };

  return (
    <div style={{ padding: 8, background: "#c0c0c0", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Display */}
      <Frame boxShadow="in" style={{ marginBottom: 8, padding: "4px 8px", background: "#bfff00", textAlign: "right" }}>
        <div style={{ fontSize: 22, fontFamily: "Courier New, monospace", overflow: "hidden", height: 32, lineHeight: "32px" }}>
          {display.length > 12 ? parseFloat(display).toExponential(6) : display}
        </div>
        <div style={{ fontSize: 10, color: "#666", height: 14 }}>
          {prev && operator ? `${prev} ${operator}` : ""}
        </div>
      </Frame>

      {/* Buttons */}
      <div className="calc-grid" style={{ flex: 1 }}>
        {/* Row 1 */}
        <Button style={btnStyle} onClick={handleClear}>C</Button>
        <Button style={btnStyle} onClick={handleSign}>+/-</Button>
        <Button style={btnStyle} onClick={handlePercent}>%</Button>
        <Button style={opStyle} onClick={() => handleOperator("/")}>÷</Button>

        {/* Row 2 */}
        <Button style={btnStyle} onClick={() => inputDigit("7")}>7</Button>
        <Button style={btnStyle} onClick={() => inputDigit("8")}>8</Button>
        <Button style={btnStyle} onClick={() => inputDigit("9")}>9</Button>
        <Button style={opStyle} onClick={() => handleOperator("*")}>×</Button>

        {/* Row 3 */}
        <Button style={btnStyle} onClick={() => inputDigit("4")}>4</Button>
        <Button style={btnStyle} onClick={() => inputDigit("5")}>5</Button>
        <Button style={btnStyle} onClick={() => inputDigit("6")}>6</Button>
        <Button style={opStyle} onClick={() => handleOperator("-")}>−</Button>

        {/* Row 4 */}
        <Button style={btnStyle} onClick={() => inputDigit("1")}>1</Button>
        <Button style={btnStyle} onClick={() => inputDigit("2")}>2</Button>
        <Button style={btnStyle} onClick={() => inputDigit("3")}>3</Button>
        <Button style={opStyle} onClick={() => handleOperator("+")}>+</Button>

        {/* Row 5 */}
        <Button style={{ ...btnStyle, gridColumn: "span 2" }} onClick={() => inputDigit("0")}>0</Button>
        <Button style={btnStyle} onClick={inputDecimal}>.</Button>
        <Button
          style={{ ...opStyle, background: "#000080", color: "white" }}
          onClick={handleEquals}
        >
          =
        </Button>
      </div>

      {/* Backspace */}
      <Button style={{ marginTop: 4, fontSize: 11 }} onClick={handleBackspace}>
        ⌫ Backspace
      </Button>
    </div>
  );
}
