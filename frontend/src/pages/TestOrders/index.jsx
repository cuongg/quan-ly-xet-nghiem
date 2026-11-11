import React from 'react'
import { Icon } from '../../components/Icon'
import { GridTable } from '../../components/GridTable'
import { TestResults } from '../TestResults'
import { format, stages } from '../../services/workspace'
import { groupOf } from '../../services/lab'
function Pill({ s }) {
  return (
    <span className={'pill p' + s}>
      <b>●</b>
      {stages[s]}
    </span>
  )
}
export function Orders({ page, shown, q, search, filter, select, open }) {
  return (
    <section className="list">
      <div className="sectionhead">
        <h2>
          {page === 'results'
            ? 'Sổ kết quả'
            : groupOf(page)
              ? 'Phiếu ' + groupOf(page).toLowerCase()
              : 'Danh sách phiếu'}
        </h2>
        <span>{shown.length} phiếu</span>
      </div>
      <div className="filters">
        <div className="search">
          <Icon name="search" />
          <input
            aria-label="Tìm phiếu"
            placeholder="Tìm theo mã phiếu, tên bệnh nhân..."
            value={q}
            onChange={(e) => search(e.target.value)}
          />
        </div>
        <select
          aria-label="Lọc trạng thái"
          value={filter}
          onChange={(e) => select(Number(e.target.value))}
        >
          <option value="-1">Tất cả trạng thái</option>
          {stages.map((s, i) => (
            <option key={s} value={i}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {page === 'list' ? (
        <GridTable
          headers={[
            'Mã phiếu',
            'Bệnh nhân',
            'Loại mẫu',
            'Thời gian lấy mẫu',
            'Trạng thái',
            'Thao tác',
          ]}
          rows={shown.map((r) => [
            r.id,
            r.id,
            <strong>{r.name}</strong>,
            r.sample,
            format(r.time),
            <Pill s={r.status} />,
            <button onClick={() => open(r)}>Mở phiếu</button>,
          ])}
        />
      ) : (
        <TestResults shown={shown} page={page} open={open} />
      )}
    </section>
  )
}
