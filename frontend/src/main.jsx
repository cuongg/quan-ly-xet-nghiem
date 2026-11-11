import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { apiBase, workspaceRequest } from './services/api'
import { loadWorkspace } from './services/workspace'
import './style.css'

function Boot() {
  const [initial, setInitial] = useState(() =>
    apiBase ? null : loadWorkspace(),
  )
  const [token, setToken] = useState(''),
    [error, setError] = useState('')
  async function connect(event) {
    event.preventDefault()
    try {
      const { data, version } = await workspaceRequest(token)
      setInitial({ ...(data ?? loadWorkspace(true)), version })
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }
  if (initial)
    return (
      <App
        initial={initial}
        remote={Boolean(apiBase)}
        token={token}
        onLogout={() => {
          setInitial(null)
          setToken('')
        }}
      />
    )
  return (
    <article>
      <section>
        <h1>Kết nối phòng xét nghiệm</h1>
        <form onSubmit={connect}>
          <label>
            Khóa truy cập API
            <input
              required
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <div className="actions">
            <button className="primary">Kết nối</button>
          </div>
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </article>
  )
}
createRoot(document.getElementById('root')).render(<Boot />)
