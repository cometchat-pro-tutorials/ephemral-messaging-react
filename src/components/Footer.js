import React from 'react'

function Footer({ message, handleChange, handleSendMessage, isSending }) {
  return (
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
  )
}

export default Footer
