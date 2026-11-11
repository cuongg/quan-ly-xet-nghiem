import React, { useState } from 'react'
import { GridTable } from '../../components/GridTable'
import { money } from '../../services/lab'
export function Catalog({ services, save }) {
  const [form, edit] = useState(null),
    [group, filter] = useState('')
  return (
    <section>
      <div className="filters">
        <select
          aria-label="Nhóm dịch vụ"
          value={group}
          onChange={(e) => filter(e.target.value)}
        >
          <option value="">Tất cả chuyên khoa</option>
          <option>Hóa sinh</option>
          <option>Huyết học</option>
        </select>
        <button
          className="primary"
          onClick={() =>
            edit({ name: '', unit: '', group: 'Hóa sinh', price: 0 })
          }
        >
          + Thêm dịch vụ
        </button>
      </div>
      {form && (
        <form
          className="editor"
          onSubmit={async (e) => {
            e.preventDefault()
            if (
              form.name.trim() &&
              form.unit.trim() &&
              (await save({
                ...form,
                name: form.name.trim(),
                unit: form.unit.trim(),
              }))
            )
              edit(null)
          }}
        >
          <div className="grid">
            {[
              ['name', 'Tên dịch vụ'],
              ['unit', 'Đơn vị đo'],
              ['price', 'Đơn giá (đ)'],
            ].map(([key, t]) => (
              <label key={key}>
                {t}
                <input
                  required
                  type={key === 'price' ? 'number' : 'text'}
                  min="0"
                  step="1"
                  value={form[key]}
                  onChange={(e) =>
                    edit({
                      ...form,
                      [key]:
                        key === 'price'
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              </label>
            ))}
            <label>
              Chuyên khoa
              <select
                value={form.group}
                onChange={(e) => edit({ ...form, group: e.target.value })}
              >
                <option>Hóa sinh</option>
                <option>Huyết học</option>
              </select>
            </label>
          </div>
          <div className="actions">
            <button>Lưu dịch vụ</button>
            <button type="button" onClick={() => edit(null)}>
              Hủy
            </button>
          </div>
        </form>
      )}
      <GridTable
        headers={['Dịch vụ', 'Chuyên khoa', 'Đơn vị', 'Đơn giá', 'Thao tác']}
        rows={services
          .filter((s) => !group || s.group === group)
          .map((s) => [
            s.i,
            s.name,
            s.group,
            s.unit,
            money(s.price),
            <button onClick={() => edit(s)}>Sửa</button>,
          ])}
      />
    </section>
  )
}
