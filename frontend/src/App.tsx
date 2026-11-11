import {newCustomerId} from './services/lab'
import React, { useState } from 'react'
import { menu } from './routes/menu'
import { localTime, fresh } from './services/workspace'
import { groupOf, total, personFrom } from './services/lab'
import { useWorkspace } from './hooks/useWorkspace'
import { Icon } from './components/Icon'
import { Customers } from './pages/Patients'
import { Catalog } from './pages/Catalog'
import { Cash } from './pages/Billing'
import { Reports } from './pages/Reports'
import { Dashboard } from './pages/Dashboard'
import { OrderEditor } from './pages/TestOrders/OrderEditor'
import { Orders } from './pages/TestOrders'
export default function App({ initial, remote, token, onLogout }) {
  const [message, notify] = useState('')
  const { db, persist } = useWorkspace(initial, remote, token, notify)
  const { records, services, customers } = db
  const [page, go] = useState('list'),
    [draft, edit] = useState(null),
    [q, search] = useState(''),
    [filter, select] = useState(-1)
  const field = (k, v) => edit({ ...draft, [k]: v })
  const navigate = (p) => {
    go(p)
    edit(null)
    notify('')
    search('')
    select(-1)
  }
  const open = (r) => {
    edit(r)
    notify('')
  }
  function saveCustomer(c) {
    return persist({
      ...db,
      customers: [...customers.filter((x) => x.customerId !== c.customerId), c],
    })
  }
  function saveService(s) {
    if (
      services.some(
        (x) =>
          x.i !== s.i &&
          x.name.toLowerCase() === s.name.toLowerCase() &&
          x.group === s.group,
      )
    ) {
      notify('Tên dịch vụ đã tồn tại trong chuyên khoa.')
      return false
    }
    return persist({
      ...db,
      services:
        s.i === undefined
          ? [...services, { ...s, i: services.length }]
          : services.map((x) => (x.i === s.i ? s : x)),
    })
  }
  function pay(id, method) {
    const r = records.find((x) => x.id === id)
    if (r && !r.payment)
      persist({
        ...db,
        records: records.map((x) =>
          x.id === id
            ? { ...x, payment: { time: localTime(), method, amount: total(x) } }
            : x,
        ),
      })
  }
  async function save(e) {
    e.preventDefault()
    if (!draft.name.trim() || !draft.rows.length)
      return notify('Vui lòng nhập họ tên và chọn ít nhất một xét nghiệm.')
    if (draft.status === 2 && draft.rows.some((r) => !r.value.trim()))
      return notify('Cần nhập đủ kết quả trước khi hoàn tất.')
    const item = {
      ...draft,
      name: draft.name.trim(),
      id:
        draft.id ||
        'XN-' +
          String(
            Math.max(0, ...records.map((r) => Number(r.id.slice(3)))) + 1,
          ).padStart(4, '0'),
    }
    const next = draft.id
      ? records.map((r) => (r.id === item.id ? item : r))
      : [item, ...records]
    item.customerId = draft.customerId || newCustomerId()
    const people = customers.some((c) => c.customerId === item.customerId)
      ? customers
      : [...customers, { ...personFrom(item), customerId: item.customerId }]
    if (!(await persist({ ...db, records: next, customers: people }))) return
    navigate(['hema', 'chem', 'results'].includes(page) ? page : 'list')
    notify('Đã lưu phiếu ' + item.id)
  }
  const normalize = (s) =>
    s
      .toLocaleLowerCase('vi')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replaceAll('đ', 'd')
  const shown = records.filter(
    (r) =>
      (!groupOf(page) || r.rows.some((x) => x.group === groupOf(page))) &&
      (filter < 0 || r.status === filter) &&
      normalize(r.name + ' ' + r.id).includes(normalize(q.trim())),
  )
  const title = draft
    ? draft.id || 'Tạo phiếu xét nghiệm'
    : menu.find(([p]) => p === page)[2]
  return (
    <>
      <aside>
        <div className="brand">
          <i>
            <Icon name="lab" />
          </i>
          LamLab
        </div>
        <small>KHÔNG GIAN LÀM VIỆC</small>
        {menu.map(([p, ic, t]) => (
          <button
            key={p}
            className={page === p ? 'active' : ''}
            onClick={() => navigate(p)}
          >
            <Icon name={ic} />
            {t}
          </button>
        ))}
        <footer>
          <span className="avatar">KT</span>
          <div>
            <strong>Kỹ thuật viên</strong>
            <small>{remote ? 'Kết nối API' : 'Không gian demo'}</small>
            {remote && <button onClick={onLogout}>Đăng xuất</button>}
          </div>
        </footer>
      </aside>
      <main>
        <header>
          Phòng xét nghiệm <span>/</span> <strong>{title}</strong>
        </header>
        <article>
          <div className="intro">
            <div>
              <small className="eyebrow">QUẢN LÝ XÉT NGHIỆM</small>
              <h1>{title}</h1>
              <p>
                {draft
                  ? 'Thông tin tiếp nhận và kết quả xét nghiệm.'
                  : {
                      dashboard: 'Tổng hợp tiến độ xử lý và danh sách phiếu.',
                      list: 'Tiếp nhận mẫu và theo dõi tiến độ từng phiếu.',
                      customers: 'Thông tin liên hệ và lịch sử xét nghiệm.',
                      cash: 'Thu phí dịch vụ và in biên nhận theo phiếu.',
                      reports:
                        'Tổng hợp hoạt động xét nghiệm và khoản thu theo kỳ.',
                      results: 'Tra cứu, hoàn tất và in kết quả theo phiếu.',
                      hema: 'Danh sách mẫu có chỉ định huyết học.',
                      chem: 'Danh sách mẫu có chỉ định hóa sinh.',
                      catalog: 'Quản lý chuyên khoa, đơn vị đo và giá dịch vụ.',
                    }[page]}
              </p>
            </div>
            {!draft && page === 'list' && (
              <button
                className="primary"
                onClick={() => {
                  edit(fresh())
                  notify('')
                }}
              >
                <Icon name="plus" />
                Tạo phiếu mới
              </button>
            )}
          </div>
          {message && <p role="status">{message}</p>}
          {draft ? (
            <OrderEditor
              {...{
                draft,
                save,
                customers,
                edit,
                field,
                services,
                navigate,
                page,
              }}
            />
          ) : page === 'customers' ? (
            <Customers
              customers={customers}
              records={records}
              save={saveCustomer}
              open={(r) => {
                navigate('list')
                open(r)
              }}
              start={(c) => {
                navigate('list')
                edit({ ...fresh(), ...c })
              }}
            />
          ) : page === 'catalog' ? (
            <Catalog services={services} save={saveService} />
          ) : page === 'cash' ? (
            <Cash records={records} pay={pay} />
          ) : page === 'reports' ? (
            <Reports records={records} today={localTime().slice(0, 10)} />
          ) : (
            <>
              {['dashboard', 'list'].includes(page) && (
                <Dashboard
                  records={records}
                  select={(i) => {
                    go('list')
                    select(i)
                  }}
                />
              )}
              <Orders
                {...{
                  page: page === 'dashboard' ? 'list' : page,
                  shown,
                  q,
                  search,
                  filter,
                  select,
                  open,
                }}
              />
            </>
          )}
        </article>
      </main>
    </>
  )
}
