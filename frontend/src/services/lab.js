export const money = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n,
  )
export const total = (r) => r.rows.reduce((n, item) => n + item.price, 0)
export const groupOf = (page) => ({ hema: 'Huyết học', chem: 'Hóa sinh' })[page]
export const personFields = [
  ['name', 'Họ và tên'],
  ['year', 'Năm sinh'],
  ['sex', 'Giới tính'],
  ['phone', 'Điện thoại'],
  ['address', 'Địa chỉ'],
]
export const personFrom = (r) =>
  Object.fromEntries(personFields.map(([key]) => [key, r[key] || '']))

export function newCustomerId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  // getRandomValues is available on HTTP origins in a local network.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2,'0')).join('')
}
