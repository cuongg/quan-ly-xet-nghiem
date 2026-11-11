import React from 'react'
export function GridTable({
  headers,
  rows,
  empty = 'Chưa có dữ liệu phù hợp.',
}) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, ...cells]) => (
            <tr key={key}>
              {cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="empty">{empty}</p>}
    </div>
  )
}
