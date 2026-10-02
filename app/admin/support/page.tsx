'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import API_BASE_URL from '@/lib/api'

export interface ChatMessage {
  chat_id: number
  chat_room_id: number
  sender_id: string
  recipient_id?: string
  sender_type: string
  message: string
  created_at: string
}

export interface ChatRoom {
  room_id: number
  user_id: number
  status: string
  created_at: string
  users?: {
    user_id: number
    email?: string
    full_name?: string
  }
  chat_messages?: ChatMessage[]
}

export default function SupportChatRoomsPage() {
  const router = useRouter()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false)
  const [replyMessage, setReplyMessage] = useState<string>('')
  const [sendingReply, setSendingReply] = useState<boolean>(false)

  const prevMessagesLengthRef = useRef<{ [roomId: number]: number }>({})

  const verifyAdminSession = useCallback(async (): Promise<string | null> => {
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('No authentication token found. Redirecting to login.')
      router.push('/login')
      return null
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/support`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        console.warn('Session expired or unauthorized. Redirecting to login.')
        localStorage.removeItem('token')
        router.push('/login')
        return null
      }

      if (!res.ok) {
        return null
      }

      return token
    } catch (err) {
      console.error('Session verification error:', err)
      localStorage.removeItem('token')
      router.push('/login')
      return null
    }
  }, [router])

  const fetchChatRooms = useCallback(async () => {
    const validToken = await verifyAdminSession()
    if (!validToken) return

    try {
      const res = await fetch(`${API_BASE_URL}/admin/chat-rooms'`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch chat rooms from backend')
      }

      const data: ChatRoom[] = await res.json()
      const rooms = data || []

      setChatRooms(rooms)

      setSelectedRoom((prevSelected) => {
        if (!prevSelected) return null
        const updated = rooms.find((r) => r.room_id === prevSelected.room_id)
        return updated || prevSelected
      })
    } catch (err) {
      console.error('Unexpected fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [verifyAdminSession])

  useEffect(() => {
    fetchChatRooms()

    const interval = setInterval(() => {
      fetchChatRooms()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchChatRooms])

  const handleSendMessage = async (roomId: number) => {
    if (!replyMessage.trim()) return
    const validToken = await verifyAdminSession()
    if (!validToken) return

    setSendingReply(true)
    try {
        const res = await fetch(`${API_BASE_URL}/admin/support/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          room_id: roomId,
          message: replyMessage,
          sender_type: 'ADMIN',
        }),
      })

      if (res.ok) {
        setReplyMessage('')
        await fetchChatRooms()
      } else {
        console.error('Failed to send reply')
      }
    } catch (err) {
      console.error('Error sending reply:', err)
    } finally {
      setSendingReply(false)
    }
  }

  const handleUpdateStatus = async (roomId: number, newStatus: string) => {
    const validToken = await verifyAdminSession()
    if (!validToken) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/support/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status on server')
      }

      setChatRooms((prev) =>
        prev.map((r) => (r.room_id === roomId ? { ...r, status: newStatus } : r))
      )

      if (selectedRoom?.room_id === roomId) {
        setSelectedRoom((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const filteredRooms = chatRooms.filter((room) => {
    const query = searchQuery.toLowerCase()
    const userEmail = room.users?.email?.toLowerCase() || ''
    const userName = room.users?.full_name?.toLowerCase() || ''
    const roomIdStr = String(room.room_id)

    const matchesSearch =
      userEmail.includes(query) || userName.includes(query) || roomIdStr.includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      room.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalOpen = chatRooms.filter((r) => r.status?.toUpperCase() === 'OPEN').length
  const totalInProgress = chatRooms.filter((r) => r.status?.toUpperCase() === 'IN_PROGRESS').length
  const totalResolved = chatRooms.filter((r) => r.status?.toUpperCase() === 'RESOLVED').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Chatrooms</h1>
          <p className="text-sm text-gray-500">
            Manage live user support requests and chat sessions from the database.
          </p>
        </div>
        <button
          onClick={() => fetchChatRooms()}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition cursor-pointer"
        >
          Refresh Rooms
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Support Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{chatRooms.length}</p>
        </div>
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Open</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{totalOpen}</p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{totalInProgress}</p>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{totalResolved}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by Room ID or User email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${selectedRoom ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">Loading support chatrooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">No active support chatrooms found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Room ID</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Latest Message</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRooms.map((room) => {
                    const sortedMsgs = room.chat_messages?.sort(
                      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                    const lastMsg = sortedMsgs && sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1].message : 'No messages'

                    return (
                      <tr
                        key={room.room_id}
                        onClick={() => setSelectedRoom(room)}
                        className={`cursor-pointer hover:bg-slate-50 transition ${
                          selectedRoom?.room_id === room.room_id ? 'bg-slate-100' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-medium text-slate-800 text-xs">#{room.room_id}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{room.users?.full_name || `User #${room.user_id}`}</p>
                          <p className="text-xs text-gray-400">{room.users?.email || `ID: ${room.user_id}`}</p>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-xs text-gray-500">{lastMsg}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                              room.status?.toUpperCase() === 'OPEN'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : room.status?.toUpperCase() === 'IN_PROGRESS'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}
                          >
                            {room.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(room.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedRoom && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 flex flex-col justify-between h-[600px]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono text-gray-400">Room #{selectedRoom.room_id}</span>
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedRoom.users?.full_name || `User ID: ${selectedRoom.user_id}`}
                </h3>
                <p className="text-xs text-gray-500">{selectedRoom.users?.email}</p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {(!selectedRoom.chat_messages || selectedRoom.chat_messages.length === 0) ? (
                <div className="text-center text-xs text-gray-400 py-12">No messages in this chatroom yet.</div>
              ) : (
                selectedRoom.chat_messages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((msg) => {
                    const isAdmin = msg.sender_type?.toUpperCase() === 'ADMIN'
                    return (
                      <div key={msg.chat_id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-md p-3 rounded-lg text-sm ${
                            isAdmin
                              ? 'bg-slate-900 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Type your reply as admin..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selectedRoom.room_id)}
                className="flex-1 px-3 py-2 text-sm text-slate-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                disabled={sendingReply}
                onClick={() => handleSendMessage(selectedRoom.room_id)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {sendingReply ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase">Change Status:</span>
                <div className="flex gap-2">
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedRoom.room_id, 'OPEN')}
                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Set Open
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedRoom.room_id, 'IN_PROGRESS')}
                    className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition cursor-pointer disabled:opacity-50"
                  >
                    In Progress
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedRoom.room_id, 'RESOLVED')}
                    className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition cursor-pointer disabled:opacity-50"
                  >
                    Set Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}