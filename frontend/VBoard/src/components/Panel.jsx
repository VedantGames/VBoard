import React, { useContext } from 'react'
import { Board } from '../contexts/Board.context'

function Panel() {
  const board = useContext(Board);

  return (
    <div className='pl-5 pt-2 flex gap-10'>
      <div className='flex gap-1'>
        {board.colors.map(color => (
          <div 
            key={color} 
            className={'size-7 rounded-full shadow-sm shadow-neutral-600 outline-slate-300 ' + (board.selectedColor === color ? 'outline' : '')}
            style={{backgroundColor: color}}
            onClick={() => board.setSelectedColor(color)}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Panel
