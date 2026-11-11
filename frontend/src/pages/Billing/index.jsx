import React, { useState } from 'react'
import { GridTable } from '../../components/GridTable'
import { money, total } from '../../services/lab'
export function Cash({ records, pay }) {
  const [id, select] = useState(''),
    [method, setMethod] = useState('Tiền mặt'),
    [term, search] = useState(''),
    [filter, setFilter] = useState('')
  const record = records.find((r) => r.id === id)
  if (record)
    return (
      <section>
        <h2>
          {record.payment ? 'Biên nhận' : 'Chi tiết thu phí'} · {id}
        </h2>
        <p>{record.name}</p>
        <GridTable
          headers={['Dịch vụ', 'Thành tiền']}
          rows={record.rows.map((r) => [r.i, r.name, money(r.price)])}
        />
        <h3>Tổng cộng · {money(total(record))}</h3>
        {record.payment ? (
          <p>
            {record.payment.method} ·{' '}
            {new Date(record.payment.time).toLocaleString('vi-VN')}
          </p>
        ) : (
          <label>
            Hình thức thanh toán
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Tiền mặt</option>
              <option>Chuyển khoản</option>
            </select>
          </label>
        )}
        <div className="actions">
          <button onClick={() => select('')}>Quay lại</button>
          {record.payment ? (
            <button onClick={() => window.print()}>In biên nhận</button>
          ) : (
            <button className="primary" onClick={() => pay(id, method)}>
              Xác nhận đã thu {money(total(record))}
            </button>
          )}
        </div>
      </section>
    )
  return (
    <section>
      <div className="filters">
        <input
          placeholder="Tìm mã phiếu hoặc khách hàng"
          aria-label="Tìm khoản thu"
          value={term}
          onChange={(e) => search(e.target.value)}
        />
        <select
          aria-label="Trạng thái thu"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tất cả khoản thu</option>
          <option value="due">Chưa thu</option>
          <option value="paid">Đã thu</option>
        </select>
      </div>
      <GridTable
        headers={[
          'Mã phiếu',
          'Khách hàng',
          'Tổng phí',
          'Trạng thái',
          'Thao tác',
        ]}
        rows={records
          .filter(
            (r) =>
              (!filter || Boolean(r.payment) === (filter === 'paid')) &&
              (r.id + ' ' + r.name)
                .toLowerCase()
                .includes(term.trim().toLowerCase()),
          )
          .map((r) => [
            r.id,
            r.id,
            r.name,
            money(total(r)),
            r.payment ? 'Đã thu' : 'Chưa thu',
            <button onClick={() => select(r.id)}>
              {r.payment ? 'Biên nhận' : 'Thu tiền'}
            </button>,
          ])}
      />
    </section>
  )
}
