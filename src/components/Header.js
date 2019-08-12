import React from 'react'

function Header({ user, handleLogout }) {
  return (
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
  )
}

export default Header
