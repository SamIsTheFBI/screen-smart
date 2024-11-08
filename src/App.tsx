import { Button } from "./components/ui/button"
import "./index.css"

function App() {
  const test = async () => {
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        alert("Hey")
      }
    })
  }

  return (
    <div className="mx-auto flex justify-center p-6">
      <Button onClick={() => test()}>Test this extension</Button>
    </div>
  )
}

export default App
