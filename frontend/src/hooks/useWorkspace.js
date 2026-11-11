import { useRef, useState } from 'react'
import { storageKey } from '../services/workspace'
import { workspaceRequest } from '../services/api'

export function useWorkspace(initial, remote, token, notify) {
  const [db, setDb] = useState(initial)
  const busy = useRef(false)
  async function persist(next) {
    if (busy.current) return false
    busy.current = true
    try {
      const { version, ...data } = next
      let updated
      if (remote) {
        updated = (await workspaceRequest(token, { version, data })).version
      } else {
        if (localStorage.getItem(storageKey) !== version)
          throw new Error(
            'Dữ liệu đã thay đổi ở cửa sổ khác. Hãy tải lại trang.',
          )
        updated = JSON.stringify(data)
        localStorage.setItem(storageKey, updated)
      }
      setDb({ ...data, version: updated })
      return true
    } catch (error) {
      notify(error.message)
      return false
    } finally {
      busy.current = false
    }
  }
  return { db, persist }
}
