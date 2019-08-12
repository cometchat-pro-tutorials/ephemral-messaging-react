import React from 'react'

function MessageList({ msg, i, user }) {
  return msg.sender.uid === user.uid ? (
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
        {msg.type === 'custom' ? msg.data.customData.text : msg.text}
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
        {msg.type === 'custom' ? msg.data.customData.text : msg.text}
      </div>

      <div
        className='message-username text-right'
        style={{ fontSize: '0.7rem' }}
      >
        -{msg.sender.uid}
      </div>
    </li>
  )
}

export default MessageList
