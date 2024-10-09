import React, { useContext, useEffect, useRef, useState } from 'react'
import { Board } from '../contexts/Board.context';
import axios from "axios";
import { motion } from 'framer-motion';

const URL = ['http://localhost:8000/calculate', 'https://vboard-server.vercel.app/calculate'];

function CanvasBoard() {
  const board = useContext(Board);
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState([]);

  const [canvasData, setCanvasData] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = board.size;
  }, []);

  const startDrawing = e => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (canvasData.length !== currentIdx+1) {
      setCanvasData(canvasData.filter((_, i) => i <= currentIdx))
    }

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  }
  
  const stopDrawing = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setCanvasData([...canvasData, ctx.getImageData(0, 0, canvas.width, canvas.height)])
    setCurrentIdx(currentIdx+1);
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
    setCanvasData([]);
    setCurrentIdx(-1);
  }

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (currentIdx <= 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    else {
      setCurrentIdx(currentIdx-1);
      ctx.putImageData(canvasData[currentIdx-1], 0, 0)
    }
  }

  const redo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (canvasData.length > currentIdx+1) {
      setCurrentIdx(currentIdx+1);
      ctx.putImageData(canvasData[currentIdx+1], 0, 0)
    }
  }

  const changeSize = e => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    board.setSize(e.target.value);
    ctx.lineWidth = board.size;
  }

  const run = () => {
    const canvas = canvasRef.current;

    axios
      .post(URL[1], {
        image: canvas.toDataURL('image/png')
      })
      .then(res => { 
        setResult([...JSON.parse(res.data.replace('"', "'").replace(/'/g, '"'))]);
        clear()
      })
      .catch(err => console.error(err));
  }

  const constraintsRef = useRef(null)

  return (
    <div className='overflow-hidden'>
      <div className='absolute flex-wrap top-0 left-0 px-2 pt-2 flex justify-between items-center w-full text-white z-50'>
        <button className='bg-[#ef4444] px-5 py-2 rounded-lg' onClick={reset}>Reset</button>
        <div className='flex flex-wrap justify-between items-center gap-3'>
          {board.colors.map(color => (
            <div 
              key={color} 
              className={'size-8 rounded-full shadow-sm shadow-neutral-600 outline-slate-300 ' + (board.selectedColor === color ? 'outline' : '')}
              style={{backgroundColor: color}}
              onClick={() => board.setSelectedColor(color)}
            ></div>
          ))}
        </div>
        <button className='bg-[#2e394e] ml-2 px-5 py-2 rounded-lg' onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          ctx.globalCompositeOperation = 'destination-out';
        }}>Eraser</button>
        <div className='flex items-center gap-2 bg-slate-800 px-5 py-2 ml-8 rounded-lg'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
          <input type="range" name="size" id="size" min={0} max={20} value={board.size} onChange={changeSize} />
          <h1 className='w-10 text-right'>
            {board.size}px
          </h1>
        </div>
        <div className='flex gap-2'>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onClick={undo}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onClick={redo}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </div>
        <button 
          className='bg-[#22c55e] px-10 py-2 rounded-lg z-50'
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
          onTouchStart={startDrawing}
          onMouseUp={stopDrawing}
          onTouchEnd={startDrawing}
          // onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchMove={draw}
          >
        </canvas>
      </motion.div>
    </div>
  )
}

export default CanvasBoard
