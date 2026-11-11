import React, { useState } from 'react'
import { GridTable } from '../../components/GridTable'
import { money } from '../../services/lab'
export function Reports({ records, today }) {
  const [from, setFrom] = useState(today.slice(0, 8) + '01'),
    [to, setTo] = useState(today)
  const within = (t) =>
    (!from || t.slice(0, 10) >= from) && (!to || t.slice(0, 10) <= to)
  const visits = records.filter((r) => within(r.time)),
    payments = records.filter((r) => r.payment && within(r.payment.time))
  return (
    <>
      <section>
        <div className="filters period">
          <label>
            Từ ngày
            <input
              type="date"
              max={to}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              min={from}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      </section>
      <div className="summary">
        {[
          ['Phiếu lấy mẫu', visits.length],
          ['Phiếu hoàn tất', visits.filter((r) => r.status === 2).length],
          [
            'Thực thu trong kỳ',
            money(payments.reduce((n, r) => n + r.payment.amount, 0)),
          ],
        ].map(([t, v]) => (
          <section key={t}>
            <small>{t}</small>
            <h2>{v}</h2>
          </section>
        ))}
      </div>
      <section>
        <h2>Khối lượng theo chuyên khoa</h2>
        <GridTable
          headers={['Chuyên khoa', 'Số phiếu', 'Số chỉ số', 'Đã nhập kết quả']}
          rows={['Hóa sinh', 'Huyết học'].map((g) => {
            const rows = visits
              .flatMap((r) => r.rows)
              .filter((r) => r.group === g)
            return [
              g,
              g,
              visits.filter((r) => r.rows.some((x) => x.group === g)).length,
              rows.length,
              rows.filter((r) => r.value.trim()).length,
            ]
          })}
        />
      </section>
      <section>
        <h2>Khoản thu trong kỳ</h2>
        <GridTable
          headers={['Mã phiếu', 'Ngày thu', 'Hình thức', 'Thực thu']}
          rows={payments.map((r) => [
            r.id,
            r.id,
            new Date(r.payment.time).toLocaleDateString('vi-VN'),
            r.payment.method,
            money(r.payment.amount),
          ])}
        />
      </section>
    </>
  )
}
