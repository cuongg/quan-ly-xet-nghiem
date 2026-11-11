import React from 'react'
import { GridTable } from '../../components/GridTable'
import { groupOf } from '../../services/lab'
export function TestResults({ shown, page, open }) {
  return (
    <GridTable
      headers={[
        'Phiếu / Khách hàng',
        'Xét nghiệm',
        'Kết quả',
        'Khoảng tham chiếu',
        'Ghi chú',
        'Thao tác',
      ]}
      rows={shown.flatMap((r) =>
        r.rows
          .filter((x) => !groupOf(page) || x.group === groupOf(page))
          .map((x) => [
            r.id + '-' + x.i,
            <>
              <strong>{r.name}</strong>
              <small>{r.id}</small>
            </>,
            x.name,
            x.value ? x.value + ' ' + x.unit : 'Chờ kết quả',
            x.ref || '—',
            x.flag || '—',
            <button onClick={() => open(r)}>
              {r.status === 2 ? 'Xem phiếu' : 'Nhập kết quả'}
            </button>,
          ]),
      )}
    />
  )
}
