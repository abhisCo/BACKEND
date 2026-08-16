import { useState,useEffect} from 'react'
import { io } from "socket.io-client";
import './App.css'

const initialMessages = [
  { id: 1, sender: 'bot', text: 'Hi! How can I help you today?' },
]

function App() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')

  const handleSend = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedInput,
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput('')

    socket.emit('ai-message', trimmedInput)

    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSend()
    }
  }

  useEffect(() => {
    let socketInstance = io("http://localhost:3000");
    setSocket(socketInstance)

    socketInstance.on('ai-message-response', (data) => {
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        timestamp: new Date().toLocaleDateString(),
        sender: 'bot'
      }

      setMessages(prevMessages => [...prevMessages, botMessage])
    })
  }, []);

  // useEffect(() => {
  //   let socketInstance = io("http://localhost:3000");
  //   setSocket(socketInstance)
  // }, []);

  return (
    <div className="app-shell">
      <div className="chat-window">
        <header className="chat-header">
          <div className="avatar">AI</div>
          <div className="header-text">
            <h2>Chat Assistant</h2>
            <p>Online</p>
          </div>
        </header>

        <main className="chat-body">
          {messages.map((message) => {
            const isUser = message.sender === 'user'

            return (
              <div
                key={message.id}
                className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}
              >
                <div className={`message-wrap ${isUser ? 'outgoing' : 'incoming'}`}>
                  <span className="message-sender">{isUser ? 'You' : 'Bot'}</span>
                  <div className={`message-bubble ${message.sender}`}>
                    {message.text}
                  </div>
                </div>
              </div>
            )
          })}
        </main>

        <footer className="chat-input-bar">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Type your message"
          />
          <button type="button" onClick={handleSend} disabled={!input.trim()}>
            Send
          </button>
        </footer>
      </div>
    </div>
  )
}

export default App
