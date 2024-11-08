import './App.css'

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
    <>
      <button onClick={() => test()}>Test this extension</button>
    </>
  )
}

export default App
