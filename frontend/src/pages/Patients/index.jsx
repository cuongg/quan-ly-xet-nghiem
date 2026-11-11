import {newCustomerId} from '../../services/lab'
import React, { useState } from 'react'
import { GridTable } from '../../components/GridTable'
import { personFrom, personFields } from '../../services/lab'
export function Customers({ customers, records, save, start, open }) {
  const [term, search] = useState(''),
    [selected, select] = useState(null),
    [form, edit] = useState(null)
  const person = customers.find((c) => c.customerId === selected)
  if (form)
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!form.name.trim()) return
          if (await save({ ...form, name: form.name.trim() })) {
            select(form.customerId)
            edit(null)
          }
        }}
      >
        <section>
          <h2>Hồ sơ khách hàng</h2>
          <div className="grid">
            {personFields.map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key === 'name'}
                  value={form[key]}
                  onChange={(e) => edit({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="actions">
            <button type="button" onClick={() => edit(null)}>
              Hủy
            </button>
            <button className="primary">Lưu khách hàng</button>
          </div>
        </section>
      </form>
    )
  if (person) {
    const visits = records.filter((r) => r.customerId === selected)
    return (
      <section>
        <div className="sectionhead">
          <h2>{person.name}</h2>
          <button onClick={() => edit(person)}>Sửa hồ sơ</button>
        </div>
        <p>
          {[person.year, person.sex, person.phone, person.address]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <h3>Lịch sử xét nghiệm</h3>
        <GridTable
          headers={['Phiếu', 'Ngày lấy mẫu', 'Dịch vụ']}
          rows={visits.map((r) => [
            r.id,
            <button className="link" onClick={() => open(r)}>
              {r.id}
            </button>,
            r.time.slice(0, 10),
            r.rows.length,
          ])}
        />
        <div className="actions">
          <button onClick={() => select(null)}>Danh sách</button>
          <button className="primary" onClick={() => start(person)}>
            Tạo phiếu cho khách
          </button>
        </div>
      </section>
    )
  }
  return (
    <section>
      <div className="filters">
        <input
          aria-label="Tìm khách hàng"
          placeholder="Tên hoặc điện thoại"
          value={term}
          onChange={(e) => search(e.target.value)}
        />
        <button
          className="primary"
          onClick={() =>
            edit({ ...personFrom({}), customerId: newCustomerId() })
          }
        >
          + Thêm khách hàng
        </button>
      </div>
      <GridTable
        headers={['Khách hàng', 'Năm sinh', 'Điện thoại', 'Lượt xét nghiệm']}
        rows={customers
          .filter((c) =>
            (c.name + ' ' + c.phone)
              .toLowerCase()
              .includes(term.trim().toLowerCase()),
          )
          .map((c) => [
            c.customerId,
            <button className="link" onClick={() => select(c.customerId)}>
              {c.name}
            </button>,
            c.year || '—',
            c.phone || '—',
            records.filter((r) => r.customerId === c.customerId).length,
          ])}
      />
    </section>
  )
}
