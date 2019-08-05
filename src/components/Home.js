import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Redirect } from 'react-router-dom'
import {
  fetchMessages,
  clearToken,
  getCurrentUser,
  getToken,
  sendTextMessage,
  loginUserWithToken
} from '../utils/Auth'

import { CometChat } from '@cometchat-pro/chat'

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
    getCurrentUser().then(
      user => {
        setUser(user)
      },
      error => {
        console.log({ error })
      }
    )
  }, [])

  useEffect(() => {
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
        <header>
          <nav className='navbar navbar-dark bg-dark'>
            <span className='navbar-brand mb-0 h1 d-block'>
              {user !== null && user.name}
            </span>
            <button onClick={handleLogout} className='btn btn-light ml-auto'>
              Logout
            </button>
          </nav>
        </header>
        <main
          ref={mainRef}
          style={{
            flex: '1',
            overflowY: 'scroll',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          className='p-4 chatscreen'
        >
          {messages.length > 0 ? (
            <ul className='list-group text-dark w-100'>
              {messages
                .filter(msg => !msg.action && !msg.deletedBy)
                .map((msg, i) =>
                  msg.sender.uid === user.uid ? (
                    <li
                      key={i + msg.sentAt}
                      className='mb-3 list-group-item list-group-item-success'
                      style={{
                        borderRadius: '10px 10px 0 10px',
                        width: 'auto',
                        marginLeft: 'auto',
                        maxWidth: '80%'
                      }}
                    >
                      <div className='message-text'>
                        {msg.type === 'custom'
                          ? msg.data.customData.text
                          : msg.text}
                      </div>

                      <div
                        className='message-username text-right'
                        style={{ fontSize: '0.8rem' }}
                      >
                        - {msg.sender.uid}
                      </div>
                    </li>
                  ) : (
                    <li
                      key={msg.sentAt * i}
                      className='mb-3 list-group-item list-group-item-primary'
                      style={{
                        borderRadius: '10px 10px 10px 0',
                        width: 'auto',
                        marginRight: 'auto',
                        maxWidth: '80%'
                      }}
                    >
                      <div className='message-text'>
                        {msg.type === 'custom'
                          ? msg.data.customData.text
                          : msg.text}
                      </div>

                      <div
                        className='message-username text-right'
                        style={{ fontSize: '0.7rem' }}
                      >
                        -{msg.sender.uid}
                      </div>
                    </li>
                  )
                )}
            </ul>
          ) : (
            <p className='lead' style={{ alignSelf: 'center' }}>
              Fetching Messages ...
            </p>
          )}
        </main>
        <footer className='pt-3'>
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div className='form-group' style={{ flex: '1' }}>
              <input
                type='text'
                placeholder='Type to start chatting...'
                className='form-control form-control'
                value={message}
                onChange={handleChange}
              />
            </div>
            <input
              style={{
                width: '80px',
                marginLeft: '0.5rem',
                marginTop: '-1rem'
              }}
              type='submit'
              value={isSending ? 'Sending' : 'Send'}
              disabled={isSending ? 'disabled' : ''}
              className='btn btn-light'
            />
          </form>
        </footer>
      </div>
    </div>
  )
}

export default Home
