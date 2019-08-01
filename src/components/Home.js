import React, { useState, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import {
  fetchMessages,
  clearToken,
  getCurrentUser,
  getToken,
  joinGroup,
  sendTextMessage,
  sendCustomMessage,
  getGroupMembers,
  loginUserWithToken
} from '../utils/Auth';

import { CometChat } from '@cometchat-pro/chat';

function Home() {
  const [isRedirected, setRedirected] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(0);
  const [isSending, setSending] = useState(false);

  const authToken = getToken('cometchat:token');

  useEffect(() => {
    if (authToken !== null) {
      loginUserWithToken(authToken).then(
        user => {
          setUser(user);
        },
        err => {
          console.log({ err });
        }
      );
    }
  }, [authToken]);

  const statusRef = useRef();

  useEffect(() => {
    // get current user
    getCurrentUser().then(
      user => {
        setUser(user);
        statusRef.current = 'Joining supergroup...';
        setStatus(statusRef.current);

        getGroupMembers().then(
          groupMembers => {
            const member = groupMembers.filter(m => m.uid === user.uid);
            if (member.length === 0) {
              joinGroup().then(
                group => {
                  statusRef.current = 'Successfully joined supergroup';
                  setStatus(statusRef.current);
                },
                error => {
                  console.log({ error });
                }
              );
            } else {
              statusRef.current = 'Already Joined supergroup';
              setStatus(statusRef.current);
            }
          },
          err => {
            console.log({ err });
          }
        );
      },
      error => {
        console.log({ error });
      }
    );
  }, []);

  useEffect(() => {
    // fetch messages
    statusRef.current = 'Fetching Messages...';
    fetchMessages().then(
      msgs => {
        setMessages(msgs);
        statusRef.current = 'Fetched messages...';
        setStatus(statusRef.current);
      },
      error => {
        statusRef.current = 'Failed to fetch messages...';
        setStatus(statusRef.current);
      }
    );
  }, []);

  useEffect(() => {
    // receive messages
    const listenerID = 'supergroup';

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: textMessage => {
          setMessages([...messages, textMessage]);
        },
        onCustomMessageReceived: customMessage => {
          setMessages([...messages, customMessage]);
        },
        onMessageDeleted: deletedMessage => {
          const filtered = messages.filter(m => m.id !== deletedMessage.id);
          setMessages([...filtered]);
        },
        onMessageDelivered: messageReceipt => {
          // console.log(messageReceipt)
          if (delay !== 0) {
            setTimeout(() => {
              CometChat.deleteMessage(messageReceipt.messageId).then(
                msg => {
                  const filtered = messages.filter(
                    m =>
                      m.id !== messageReceipt.messageId &&
                      m.action !== 'deleted'
                  );
                  setMessages([...filtered]);
                },
                err => {}
              );
            }, delay);
          }
        }
      })
    );

    return () => CometChat.removeMessageListener(listenerID);
  }, [messages, delay]);

  const handleSendMessage = e => {
    e.preventDefault();

    setSending(true);

    if (delay === 0) {
      sendTextMessage(message).then(
        msg => {
          setMessage('');
          setSending(false);
          setMessages([...messages, msg]);
        },
        error => {
          setSending(false);
          console.log({ error });
        }
      );
    } else {
      sendCustomMessage({ text: message, delay }).then(
        msg => {
          setMessage('');
          setSending(false);
          setMessages([...messages, msg]);
        },
        err => {
          setSending(false);
          console.log({ err });
        }
      );
    }
  };

  const handleLogout = () => {
    clearToken('cometchat:token');
    setRedirected(true);
  };

  if (authToken === null || isRedirected) return <Redirect to='/login' />;

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
              <small className='d-block' style={{ fontSize: '0.8rem' }}>
                {status}
              </small>
            </span>
            <button onClick={handleLogout} className='btn btn-light ml-auto'>
              Logout
            </button>
          </nav>
        </header>
        <main
          style={{
            flex: '1',
            overflowY: 'scroll',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className='p-4 chatscreen'
        >
          {messages.length > 0 ? (
            <ul className='list-group text-dark w-100'>
              {messages
                .filter(msg => !msg.action)
                .filter(msg => !msg.deletedAt)
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
            <p className='lead'>Fetching Messages ...</p>
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
            <div
              className='form-group'
              style={{ width: '70px', marginRight: '0.5rem' }}
            >
              <select
                name='delay'
                className='form-control'
                id='delay'
                onChange={e => setDelay(parseInt(e.target.value))}
              >
                <option value='0'>Destruct In</option>
                <option value='5000'>5 Seconds</option>
                <option value='10000'>10 Seconds</option>
              </select>
            </div>
            <div className='form-group' style={{ flex: '1' }}>
              <input
                type='text'
                placeholder='Type to start chatting...'
                className='form-control form-control'
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            <input
              style={{
                width: '70px',
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
  );
}

export default Home;
