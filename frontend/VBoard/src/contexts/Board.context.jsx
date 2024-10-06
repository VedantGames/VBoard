import React, { createContext, useState } from 'react'

export const Board = createContext(null);

function BoardContext({children}) {
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const colors = [
      "#000000",  // black
    "#ffffff",  // white
    "#ee3333",  // red
    "#e64980",  // pink
    "#be4bdb",  // purple
    "#893200",  // brown
    "#228be6",  // blue
    "#3333ee",  // dark blue
    "#40c057",  // green
    "#00aa00",  // dark green
    "#fab005",  // yellow
    "#fd7e14",  // orange
  ]

  return (
    <Board.Provider value={{selectedColor, setSelectedColor, colors}}>
      {children}
    </Board.Provider>
  )
}

export default BoardContext