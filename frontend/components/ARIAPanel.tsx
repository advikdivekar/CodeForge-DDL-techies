'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, RefreshCw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'aria'
  content: string
}

export default function ARIAPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'aria', content: 'Hello! I am ARIA, your Options Intelligence assistant. Ask me anything about signals, PCR, OI buildup, or current market conditions.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: [] })
      })
      const data = await res.json()

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'aria',
        content: data.response || data.answer || "I'm sorry, I couldn't process that request."
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'aria',
        content: "Network error occurred connecting to ARIA."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border border-white/60 bg-white/60 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_8px_32px_-10px_rgba(0,0,0,0.1)] relative">
      <div className="bg-white/40 border-b border-white/40 p-4 flex items-center gap-3 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
        <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
          <MessageSquare className="text-indigo-600 w-5 h-5" />
        </div>
        <div>
          <h3 className="text-slate-900 font-heading font-bold flex items-center gap-2">
            ARIA
            <span className="bg-indigo-100/80 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-heading font-bold uppercase tracking-wider border border-indigo-200/50">Beta</span>
          </h3>
          <p className="text-slate-500 text-xs font-heading font-medium">Llama-3.3-70b AI Options Analyst</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent pt-24 pb-20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${msg.role === 'user'
                ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-[0_4px_16px_rgba(79,70,229,0.3)]'
                : 'bg-white/90 border-white/80 text-slate-800 rounded-tl-sm backdrop-blur-xl shadow-lg'
                }`}
            >
              {msg.role === 'aria' ? (
                <div
                  className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-p:font-medium prose-headings:font-heading prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              ) : (
                <div className="text-[15px] leading-relaxed font-heading font-medium">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/90 backdrop-blur-xl border border-white/80 text-slate-500 rounded-2xl rounded-tl-sm p-4 shadow-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-sm font-heading font-medium">ARIA is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/40 backdrop-blur-md border-t border-white/40 absolute bottom-0 left-0 right-0 z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ARIA about the option chain..."
            className="w-full bg-white/80 backdrop-blur-xl border border-white/80 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner text-slate-800 placeholder-slate-400 transition-all font-heading font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-full transition-colors shadow-md disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
