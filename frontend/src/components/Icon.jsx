import React from 'react'
const icons = {
  lab: 'M9 3h6m-5 0v6L4 19q-1 2 2 2h12q3 0 2-2l-6-10V3M7 15h10',
  list: 'M4 4h16v16H4zM8 9h8M8 14h6',
  book: 'M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14',
  clock: 'M12 3a9 9 0 1 0 .01 0M12 7v5l3 2',
  check: 'M4 12l5 5L20 6',
  search: 'M16 16l5 5M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M8 12h9m-4-4 4 4-4 4',
}
export function Icon({ name }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  )
}
Object.assign(icons, {
  person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
  wallet: 'M3 6h18v14H3zM3 6l13-4v4M16 11h5v4h-5z',
  drop: 'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z',
  chart: 'M3 3v18h18M7 17v-5m5 5V7m5 10V9',
})
