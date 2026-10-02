'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import API_BASE_URL from '@/lib/api'
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bot,
  User,
  Radio,
  X,
  MessageCircle,
  Minimize2,
  AlertCircle,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

interface ChatMessage {
  chat_id?: number
  chat_room_id?: number
  sender_id: string
  recipient_id?: string | null
  sender_type: 'ADMIN' | 'CUSTOMER' | 'admin' | 'customer'
  message: string
  created_at?: string
}

const faqs: FAQItem[] = [
  {
    category: 'Transfers',
    question: 'How long do international wire transfers take?',
    answer:
      'International wire transfers typically process within 1 to 5 business days, depending on destination bank clearing routes.',
  },
  {
    category: 'Transfers',
    question: 'What are the transfer fees for outward wires?',
    answer:
      'Standard transfer fees vary based on account tier and destination currency, displayed dynamically prior to transfer confirmation.',
  },
  {
    category: 'Security',
    question: 'What should I do if I suspect unauthorized activity?',
    answer:
      'Immediately freeze your cards via the Cards section and contact our support desk or submit an urgent ticket.',
  },
  {
    category: 'Accounts',
    question: 'How can I download my monthly account statements?',
    answer:
      'Navigate to More > Statements on your main dashboard to view and download official PDF statements.',
  },
]

export default function SupportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Ticket Form state
  const [subject, setSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)

  // Chat Box Toggle
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false)

  // WebSocket / Chat State
  const [userId, setUserId] = useState<string | null>(null)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Loading safety fallback so it never stays stuck indefinitely
  const [isInitialized, setIsInitialized] = useState(false)

  const mainChatEndRef = useRef<HTMLDivElement>(null)
  const boxChatEndRef = useRef<HTMLDivElement>(null)

  // 1. Initialize User & Chat History safely via dynamic backend profile fetch
  useEffect(() => {
    let isMounted = true

    async function initializeUserAndHistory() {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Fetch current user details from your exact backend dashboard route
        const userRes = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => null)

        let currentUserId = '1'
        let email = 'user@example.com'

        if (userRes && userRes.ok) {
          const userData = await userRes.json()
          // Matches your backend dictionary keys: user_id or id
          currentUserId = String(userData.user_id || userData.id || '1')
          email = userData.users?.email || 'user@example.com'
        } else {
          const storedId = localStorage.getItem('user_id')
          const storedEmail = localStorage.getItem('user_email')
          if (storedId) currentUserId = storedId
          if (storedEmail) email = storedEmail
        }

        if (!isMounted) return
        setUserId(currentUserId)
        setUserEmail(email)
        setIsInitialized(true)

        // Fetch chat history using the dynamic user ID
        const historyRes = await fetch(
          `${API_BASE_URL}/ws/support/users/chat/history/${currentUserId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => null)

        if (historyRes && historyRes.ok && isMounted) {
          const historyData = await historyRes.json()
          setChatMessages(historyData.messages || historyData || [])
        }
      } catch (err) {
        console.error('Initialization error:', err)
        if (isMounted) {
          setUserId('1')
          setUserEmail('user@example.com')
          setIsInitialized(true)
        }
      }
    }

    initializeUserAndHistory()

    return () => {
      isMounted = false
    }
  }, [router])

  // 2. Establish WebSocket Connection with clean lifecycle control
  useEffect(() => {
    if (!userId) return

    let isSubscribed = true
    const token = localStorage.getItem('token')
    const host = process.env.NEXT_PUBLIC_WS_HOST || `${API_BASE_URL}`

    if (!token) return

    const wsUrl = `ws://${host}/ws/support/users/${userId}?token=${token}`
    const ws = new WebSocket(wsUrl)
    setSocket(ws)

    ws.onopen = () => {
      if (isSubscribed) setIsConnected(true)
    }

    ws.onmessage = (event) => {
      if (!isSubscribed) return
      try {
        const data: ChatMessage = JSON.parse(event.data)
        setChatMessages((prev) => [...prev, data])
      } catch (e) {
        console.error('Failed to parse incoming WebSocket message', e)
      }
    }

    ws.onclose = () => {
      if (isSubscribed) setIsConnected(false)
    }

    ws.onerror = () => {
      if (isSubscribed) setIsConnected(false)
    }

    return () => {
      isSubscribed = false
      setIsConnected(false)

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Support page unmounted")
      }
    }
  }, [userId])

  // Scroll to bottom on new messages
  useEffect(() => {
    mainChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    boxChatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatBoxOpen])

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN || !userId) return

    const messageText = inputMessage.trim()
    const payload = {
      message: messageText,
    }

    // Send to WebSocket backend
    socket.send(JSON.stringify(payload))

    // Optimistically update local UI immediately
    const optimisticMsg: ChatMessage = {
      sender_id: userId,
      sender_type: 'CUSTOMER',
      message: messageText,
      created_at: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, optimisticMsg])
    setInputMessage('')
  }

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !ticketMessage || !userId) return

    const token = localStorage.getItem('token')
    if (!token) {
      if (socket) socket.close()
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setTicketError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          user_email: userEmail || 'user@example.com',
          subject,
          message: ticketMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit support ticket. Please try again.')
      }

      const formattedTicketText = `【Support Ticket Submission】\nEmail: ${userEmail}\nSubject: ${subject}\n\n${ticketMessage}`

      const newChatMessage: ChatMessage = {
        sender_id: userId,
        sender_type: 'CUSTOMER',
        message: formattedTicketText,
        created_at: new Date().toISOString(),
      }

      setChatMessages((prev) => [...prev, newChatMessage])
      setSubmitted(true)
      setSubject('')
      setTicketMessage('')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      setTicketError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0b1320] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading support portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1320] text-white pb-16 font-sans relative">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close(1000, "Leaving support")
              }
              router.push('/dashboard')
            }}
            className="w-10 h-10 rounded-xl bg-[#132238] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Help & Support Center
            </h1>
            <p className="text-xs text-slate-400">
              Assistance & Real-Time Support Desk
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Phone Support</p>
              <p className="text-sm font-bold text-slate-100">+1 (800) 555-0199</p>
            </div>
          </div>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Email Support</p>
              <p className="text-sm font-bold text-slate-100">support@viewmtrust.com</p>
            </div>
          </div>

          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Response Desk</p>
              <p className="text-sm font-bold text-slate-100">24/7 Priority Support</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            Live Support Chat
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ticket'
                ? 'border-b-2 border-amber-500 text-amber-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Submit Support Ticket
          </button>
        </div>

        {/* TAB 1: Main Real-Time Chat Panel */}
        {activeTab === 'chat' && (
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col h-[500px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {isConnected ? 'Live WebSocket Connected' : 'Disconnected / Reconnecting...'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                User ID: {userId || '...'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Bot className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
                  <p>No previous messages found. Type below to send a message to support.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isAdmin =
                    msg.sender_type?.toUpperCase() === 'ADMIN' ||
                    msg.sender_id === 'SUPPORT AGENT'

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-[#0b1320] border border-slate-800 text-slate-200 rounded-tl-none'
                            : 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        }`}
                      >
                        <p>{msg.message}</p>
                        {msg.created_at && (
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isAdmin ? 'text-slate-500' : 'text-slate-800'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={mainChatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1 bg-[#0b1320] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputMessage.trim()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Support Ticket Submission */}
        {activeTab === 'ticket' && (
          <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-white">Submit a Support Ticket</h2>
            </div>

            {ticketError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ticketError}</span>
              </div>
            )}

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-400 text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Ticket Submitted & Routed to Live Chat</p>
                    <p className="text-slate-300 mt-0.5">
                      Your inquiry was appended directly into your live chat session.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Wire transfer inquiry or account question"
                    className="w-full bg-[#0b1320] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-[#0b1320] border border-slate-700 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* FAQs Section */}
        <div className="bg-[#132238] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-800/80">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 hover:opacity-80 transition cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-200">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="mt-2 text-xs text-slate-400 leading-relaxed pl-1 border-l-2 border-amber-500/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Encrypted 256-Bit SSL Connection</span>
        </div>
      </main>

      {/* Floating Chat Box Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatBoxOpen && (
          <div className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] bg-[#132238] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#0b1320] border-b border-slate-800 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    VT
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#0b1320] ${
                      isConnected ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Live Support</h3>
                  <p className="text-[10px] text-slate-400">
                    {isConnected ? 'Online & Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatBoxOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-[#0b1320]/50 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                  <Bot className="w-8 h-8 text-amber-500 opacity-50 mb-2" />
                  <p className="font-semibold text-slate-300">Start a Conversation</p>
                  <p className="text-[11px] mt-1">Send a message to connect with an agent.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isAdmin =
                    msg.sender_type?.toUpperCase() === 'ADMIN' ||
                    msg.sender_id === 'SUPPORT AGENT'

                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl leading-relaxed text-[11px] whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-[#0b1320] border border-slate-800 text-slate-200 rounded-tl-none'
                            : 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        }`}
                      >
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={boxChatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="p-3 bg-[#0b1320] border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={!isConnected}
                className="flex-1 bg-[#132238] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputMessage.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatBoxOpen(!isChatBoxOpen)}
          className="w-13 h-13 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative"
        >
          {isChatBoxOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0b1320]">
                  {chatMessages.length}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  )
}