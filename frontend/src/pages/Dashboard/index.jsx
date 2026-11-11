import React from 'react'
import { Icon } from '../../components/Icon'
import { stages } from '../../services/workspace'
export function Dashboard({ records, select }) {
  return (
    <div className="stats">
      {['Tổng số phiếu', ...stages].map((s, i) => (
        <button key={s} onClick={() => select(i - 1)}>
          <div className={'badge b' + i}>
            <Icon name={['list', 'clock', 'lab', 'check'][i]} />
          </div>
          <div>
            <small>{s}</small>
            <strong>
              {i
                ? records.filter((r) => r.status === i - 1).length
                : records.length}
            </strong>
          </div>
        </button>
      ))}
    </div>
  )
}
