"use client";

import { useState, useCallback } from "react";
import { Button, Frame } from "@react95/core";

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function createBoard(firstRow: number, firstCol: number): CellState[][] {
  // Place mines avoiding first click
  const minePositions = new Set<string>();
  while (minePositions.size < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (Math.abs(r - firstRow) > 1 || Math.abs(c - firstCol) > 1) {
      minePositions.add(`${r},${c}`);
    }
  }

  const board: CellState[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      isMine: minePositions.has(`${r},${c}`),
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );

  // Calculate neighbor counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
              count++;
            }
          }
        }
        board[r][c].neighborCount = count;
      }
    }
  }

  return board;
}

function revealCells(board: CellState[][], row: number, col: number): CellState[][] {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;

    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].neighborCount === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }

  return newBoard;
}

type GameState = "idle" | "playing" | "won" | "lost";

export default function Minesweeper() {
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [faceEmoji, setFaceEmoji] = useState("🙂");

  const resetGame = () => {
    setBoard(null);
    setGameState("idle");
    setFlagsLeft(MINES);
    setFaceEmoji("🙂");
  };

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState === "won" || gameState === "lost") return;

      let currentBoard = board;

      // First click — generate board
      if (!currentBoard) {
        currentBoard = createBoard(row, col);
        setGameState("playing");
      }

      const cell = currentBoard[row][col];
      if (cell.isRevealed || cell.isFlagged) return;

      if (cell.isMine) {
        // Reveal all mines
        const lostBoard = currentBoard.map((r) =>
          r.map((c) => ({
            ...c,
            isRevealed: c.isMine ? true : c.isRevealed,
          }))
        );
        lostBoard[row][col] = { ...lostBoard[row][col], isRevealed: true };
        setBoard(lostBoard);
        setGameState("lost");
        setFaceEmoji("😵");
        return;
      }

      const newBoard = revealCells(currentBoard, row, col);

      // Check win: all non-mine cells revealed
      const totalSafe = ROWS * COLS - MINES;
      const revealed = newBoard.flat().filter((c) => c.isRevealed && !c.isMine).length;

      setBoard(newBoard);
      if (revealed === totalSafe) {
        setGameState("won");
        setFaceEmoji("😎");
      }
    },
    [board, gameState]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (!board || gameState === "won" || gameState === "lost") return;
      const cell = board[row][col];
      if (cell.isRevealed) return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
      setBoard(newBoard);
      setFlagsLeft((f) => f + (cell.isFlagged ? 1 : -1));
    },
    [board, gameState]
  );

  const getCellContent = (cell: CellState) => {
    if (cell.isFlagged && !cell.isRevealed) return "🚩";
    if (!cell.isRevealed) return "";
    if (cell.isMine) return "💣";
    if (cell.neighborCount === 0) return "";
    return cell.neighborCount;
  };

  const getCellClass = (cell: CellState) => {
    let cls = "mine-cell";
    if (cell.isRevealed) cls += " revealed";
    if (cell.isRevealed && cell.isMine) cls += " mine-exploded";
    if (cell.isRevealed && cell.neighborCount > 0 && !cell.isMine)
      cls += ` mine-${cell.neighborCount}`;
    return cls;
  };

  const displayBoard = board || Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );

  return (
    <div style={{ height: "100%", background: "#c0c0c0", display: "flex", flexDirection: "column", alignItems: "center", padding: 8 }}>
      {/* Header */}
      <Frame
        boxShadow="in"
        style={{ width: "100%", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
      >
        {/* Mine counter */}
        <Frame boxShadow="in" style={{ padding: "2px 8px", background: "#000", color: "red", fontFamily: "Courier New", fontSize: 20, minWidth: 48, textAlign: "center" }}>
          {String(flagsLeft).padStart(3, "0")}
        </Frame>

        {/* Face button */}
        <Button
          style={{ fontSize: 20, width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={resetGame}
          onMouseDown={() => setFaceEmoji("😮")}
          onMouseUp={() => gameState !== "won" && gameState !== "lost" && setFaceEmoji("🙂")}
        >
          {faceEmoji}
        </Button>

        {/* Timer placeholder */}
        <Frame boxShadow="in" style={{ padding: "2px 8px", background: "#000", color: "red", fontFamily: "Courier New", fontSize: 20, minWidth: 48, textAlign: "center" }}>
          000
        </Frame>
      </Frame>

      {/* Game messages */}
      {gameState === "won" && (
        <div style={{ color: "#008000", fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>
          🎉 You Win! Click 😎 to play again.
        </div>
      )}
      {gameState === "lost" && (
        <div style={{ color: "red", fontWeight: "bold", fontSize: 12, marginBottom: 4 }}>
          💥 Game Over! Click 😵 to try again.
        </div>
      )}
      {gameState === "idle" && (
        <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
          Click any cell to start! Right-click to flag mines.
        </div>
      )}

      {/* Grid */}
      <Frame boxShadow="in">
        <div
          className="mine-grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 24px)` }}
        >
          {displayBoard.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={getCellClass(cell)}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
              >
                {getCellContent(cell)}
              </div>
            ))
          )}
        </div>
      </Frame>

      <div style={{ marginTop: 8, fontSize: 10, color: "#666", textAlign: "center" }}>
        {ROWS}×{COLS} · {MINES} mines
      </div>
    </div>
  );
}
