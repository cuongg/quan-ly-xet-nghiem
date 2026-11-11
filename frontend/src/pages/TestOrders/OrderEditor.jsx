import React from 'react'
import { personFrom } from '../../services/lab'
import { row, stages } from '../../services/workspace'
export function OrderEditor({
  draft,
  save,
  customers,
  edit,
  field,
  services,
  navigate,
  page,
}) {
  return (
    <form onSubmit={save}>
      <section>
        <h2>Thông tin tiếp nhận</h2>
        {!draft.id && (
          <label className="picker">
            Chọn khách hàng
            <select
              value={draft.customerId || ''}
              onChange={(e) => {
                const c = customers.find((c) => c.customerId === e.target.value)
                edit({
                  ...draft,
                  ...personFrom(c || {}),
                  customerId: c?.customerId,
                })
              }}
            >
              <option value="">Khách hàng mới</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.name} · {c.phone || c.year}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="grid">
          {[
            ['name', 'Họ và tên'],
            ['year', 'Năm sinh', 'number'],
            ['sex', 'Giới tính'],
            ['phone', 'Số điện thoại'],
            ['address', 'Địa chỉ'],
            ['doctor', 'Bác sĩ chỉ định'],
            ['diagnosis', 'Chẩn đoán'],
            ['sample', 'Loại mẫu'],
            ['time', 'Thời gian lấy mẫu', 'datetime-local'],
            ['received', 'Thời gian nhận mẫu', 'datetime-local'],
            ['note', 'Ghi chú'],
          ].map(([k, t, type]) => (
            <label key={k}>
              {t}
              <input
                required={['name', 'sample', 'time'].includes(k)}
                type={type || 'text'}
                value={draft[k]}
                onChange={(e) => field(k, e.target.value)}
              />
            </label>
          ))}
        </div>
      </section>
      <section>
        <h2>Kết quả xét nghiệm</h2>
        <select
          disabled={Boolean(draft.payment)}
          aria-label="Thêm dịch vụ"
          value=""
          onChange={(e) =>
            field('rows', [
              ...draft.rows,
              {
                ...row(Number(e.target.value)),
                ...services[Number(e.target.value)],
              },
            ])
          }
        >
          <option value="" disabled>
            + Thêm dịch vụ xét nghiệm
          </option>
          {services.map(
            ({ name: t, i, group }) =>
              !draft.rows.some((r) => r.i === i) && (
                <option key={t} value={i}>
                  {group} · {t}
                </option>
              ),
          )}
        </select>
        {draft.rows.map((r, n) => (
          <div className="result" key={r.i}>
            <strong>
              {r.name} · {r.unit}
            </strong>
            {[
              ['value', 'Kết quả'],
              ['ref', 'Khoảng tham chiếu'],
              ['flag', 'Ghi chú'],
            ].map(([k, t]) => (
              <label key={k}>
                {t}
                <input
                  value={r[k]}
                  onChange={(e) =>
                    field(
                      'rows',
                      draft.rows.map((a, b) =>
                        b === n ? { ...a, [k]: e.target.value } : a,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <button
              disabled={Boolean(draft.payment)}
              type="button"
              onClick={() =>
                field(
                  'rows',
                  draft.rows.filter((a) => a.i !== r.i),
                )
              }
            >
              Bỏ
            </button>
          </div>
        ))}
      </section>
      <label>
        Trạng thái
        <select
          value={draft.status}
          onChange={(e) => field('status', Number(e.target.value))}
        >
          {stages.map((s, i) => (
            <option key={s} value={i}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <div className="actions">
        <button type="button" onClick={() => navigate(page)}>
          Quay lại
        </button>
        {draft.id && (
          <button type="button" onClick={() => window.print()}>
            In phiếu hiện tại
          </button>
        )}
        <button className="primary">Lưu phiếu</button>
      </div>
    </form>
  )
}
