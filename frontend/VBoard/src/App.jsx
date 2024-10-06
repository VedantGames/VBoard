import CanvasBoard from "./components/CanvasBoard"
import Panel from "./components/Panel"
import BoardContext from "./contexts/Board.context"

function App() {
  return (
    <div className='bg-color h-svh'>
      <BoardContext>
        <CanvasBoard />
      </BoardContext>
    </div>
  )
}

export default App
