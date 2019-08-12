import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Redirect } from 'react-router-dom'
import {
  fetchMessages,
  clearToken,
  getToken,
  sendTextMessage,
  loginUserWithToken
} from '../utils/CometChat'

import { CometChat } from '@cometchat-pro/chat'
import Header from './Header'
import Footer from './Footer'
import MessageList from './MessageList'

function Home() {
  const [isRedirected, setRedirected] = useState(false)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [isSending, setSending] = useState(false)

  const authToken = getToken('cometchat:token')
  const mainRef = useRef()

  const scrollToBottom = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, mainRef.current.scrollHeight)
    }
  }

  useEffect(() => {
    if (authToken !== null) {
      loginUserWithToken(authToken).then(
        user => {
          setUser(user)
        },
        err => {
          console.log({ err })
        }
      )
    }
  }, [authToken])

  useEffect(() => {
    // get current user
    // getCurrentUser().then(
    //   user => {
    //     setUser(user)
    //   },
    //   error => {
    //     console.log({ error })
    //   }
    // )

    // fetch last 100 messages
    fetchMessages().then(
      msgs => {
        setMessages(msgs)
        scrollToBottom()
        msgs.forEach(
          m => m.data.text !== undefined && CometChat.markMessageAsRead(m)
        )
      },
      error => {
        console.log({ error })
      }
    )
  }, [])

  useEffect(() => {
    // receive messages
    const listenerID = 'supergroup'

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: textMessage => {
          setMessages([...messages, textMessage])
          CometChat.markMessageAsRead(textMessage)
          scrollToBottom()
        },
        onMessageDeleted: deletedMessage => {
          const filtered = messages.filter(m => m.id !== deletedMessage.id)
          setMessages([...filtered])
          scrollToBottom()
        },

        onMessageRead: messageReceipt => {
          setTimeout(() => {
            CometChat.deleteMessage(messageReceipt.messageId).then(
              msg => {
                const filtered = messages.filter(
                  m =>
                    m.id !== messageReceipt.messageId && m.action === 'deleted'
                )
                setMessages([...filtered])
                scrollToBottom()
              },
              err => {}
            )
          }, 5000)
        }
      })
    )

    return () => CometChat.removeMessageListener(listenerID)
  }, [messages, user])

  const handleSendMessage = e => {
    e.preventDefault()

    const newMessage = message
    setSending(true)
    setMessage('')

    sendTextMessage(newMessage).then(
      msg => {
        setSending(false)
        setMessages([...messages, msg])
      },
      error => {
        setSending(false)
        console.log({ error })
      }
    )
  }

  const handleLogout = () => {
    clearToken('cometchat:token')
    setRedirected(true)
  }

  const handleChange = useCallback(e => {
    setMessage(e.target.value)
  }, [])

  if (authToken === null || isRedirected) return <Redirect to='/login' />

  return (
    <div className='container text-white' style={{ height: '100vh' }}>
      <div
        className='home'
        style={{
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Header user={user} handleLogout={handleLogout} />
        <main
          ref={mainRef}
          style={{
            flex: '1',
            overflowY: 'scroll',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          className='p-4'
        >
          <ul className='list-group w-100'>
            {messages.length > 0 ? (
              messages
                .filter(msg => !msg.action && !msg.deletedBy)
                .map((msg, i) => (
                  <MessageList
                    user={user}
                    msg={msg}
                    i={i}
                    key={i + msg.sentAt}
                  />
                ))
            ) : (
              <p className='lead' style={{ alignSelf: 'center' }}>
                Fetching Messages ...
              </p>
            )}
          </ul>
        </main>
        <Footer
          isSending={isSending}
          handleSendMessage={handleSendMessage}
          message={message}
          handleChange={handleChange}
        />
      </div>
    </div>
  )
}

export default Home
