import React, { useState, useEffect, useRef } from 'react'
import { Redirect } from 'react-router-dom'
import { loginUser, setToken } from '../utils/Auth'

function Login() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isRedirected, setRedirected] = useState(false)
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => (isMounted.current = false)
  }, [])

  const handleChange = e => {
    setUsername(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()

    setSubmitting(true)
    setError(null)

    loginUser(username)
      .then(({ authToken }) => {
        if (isMounted.current === true) {
          setSubmitting(false)
          setToken('cometchat:token', authToken)
          setRedirected(true)
        }
      })
      .catch(({ code }) => {
        if (isMounted.current === true) {
          if (code === 'ERR_UID_NOT_FOUND') {
            setError('User not found, try creating an account')
          }
          setSubmitting(false)
        }
      })
  }

  if (isRedirected) return <Redirect to='/' />

  return (
    <div className='container text-white'>
      <div className='row'>
        <div className='col-xs-12 col-sm-12 col-md-8 col-lg-6 mx-auto mt-5'>
          <h1 className='text-white' style={{ fontWeight: '700' }}>
            Login
          </h1>
          {error !== null && <div className='alert alert-danger'>{error}</div>}
          <div className='card card-body bg-secondary'>
            <form onSubmit={e => handleSubmit(e)}>
              <div className='form-group'>
                <label htmlFor='username'>Username</label>
                <input
                  type='text'
                  name='username'
                  id='username'
                  className='form-control'
                  placeholder='Type your username'
                  value={username}
                  onChange={handleChange}
                  required
                />
              </div>

              <input
                disabled={isSubmitting ? 'disabled' : ''}
                type='submit'
                value={isSubmitting ? 'Please wait...' : 'Login'}
                className='btn btn-dark mb-2'
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
