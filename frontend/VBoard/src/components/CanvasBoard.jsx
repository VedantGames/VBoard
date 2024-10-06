import React, { useContext, useEffect, useRef, useState } from 'react'
import { Board } from '../contexts/Board.context';
import axios from "axios";
import { motion } from 'framer-motion';

function CanvasBoard() {
  const board = useContext(Board);
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
  }, []);

  const startDrawing = e => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  }

  const stopDrawing = () => {
    setIsDrawing(false);
  }

  const draw = e => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    

    ctx.strokeStyle = board.selectedColor;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const reset = () => {
    clear();
    setResult([]);
  }

  const run = e => {
    const canvas = canvasRef.current;

    axios
      .post("https://vboard-server.vercel.app/calculate", {
        image: canvas.toDataURL('image/png')
      })
      .then(res => { setResult([...JSON.parse(res.data.replace(/'/g, '"'))]); clear() })
      .catch(err => console.error(err));
  }

  const constraintsRef = useRef(null)

  return (
    <div className='overflow-hidden'>
      <div className='absolute top-0 left-0 px-2 pt-2 flex justify-between w-full text-white z-50'>
        <button className='bg-[#ef4444] px-5 py-2 rounded-lg' onClick={reset}>Reset</button>
        <div className='flex gap-3'>
          {board.colors.map(color => (
            <div 
              key={color} 
              className={'size-8 rounded-full shadow-sm shadow-neutral-600 outline-slate-300 ' + (board.selectedColor === color ? 'outline' : '')}
              style={{backgroundColor: color}}
              onClick={() => board.setSelectedColor(color)}
            ></div>
          ))}
        </div>
        <button className='bg-[#6b7280] px-5 py-2 rounded-lg'>Clear</button>
        <button 
          className='bg-[#22c55e] px-10 rounded-lg z-50'
          onClick={run}
        >Calculate</button>
      </div>
      <motion.div ref={constraintsRef} className='absolute top-0 left-0 pt-20 text-white text-lg w-full h-full z-10'>
        {result.length > 0 && result.map((equation, i) => (
          <motion.div 
            key={i}
            className='bg-transparent size-max z-10'
            drag
            dragConstraints={constraintsRef}
          >{equation.expr} = {equation.result}</motion.div>
        ))}
        <canvas 
          ref={canvasRef}
          width={window.outerWidth} 
          height={window.innerHeight-36}
          className='absolute bottom-0 -z-10'
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          // onMouseOut={stopDrawing}
          onMouseMove={draw}
          >
        </canvas>
      </motion.div>
    </div>
  )
}

export default CanvasBoard
