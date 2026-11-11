import { personFrom } from './lab'
const tests = [
  ['Glucose', 'mmol/L'],
  ['Cholesterol', 'mmol/L'],
  ['Triglyceride', 'mmol/L'],
  ['HDL-Cholesterol', 'mmol/L'],
  ['LDL-Cholesterol', 'mmol/L'],
  ['AST (GOT)', 'U/L'],
  ['ALT (GPT)', 'U/L'],
  ['GGT', 'U/L'],
  ['Ure', 'mmol/L'],
  ['Creatinine', 'µmol/L'],
  ['Acid uric', 'µmol/L'],
  ['Amylase', 'U/L'],
  ['Canxi toàn phần', 'mmol/L'],
  ['Protein toàn phần', 'g/L'],
  ['Albumin', 'g/L'],
  ['Bilirubin toàn phần', 'µmol/L'],
  ['Bilirubin trực tiếp', 'µmol/L'],
]
const stages = ['Chờ xử lý', 'Đang xét nghiệm', 'Hoàn tất']
const names = [
  'Lê Minh Anh',
  'Nguyễn Hoàng Nam',
  'Trần Thu Hà',
  'Phạm Gia Bảo',
  'Vũ Thanh Mai',
  'Đỗ Hải Yến',
  'Hoàng Đức Huy',
  'Ngô Bảo Ngọc',
]
const localTime = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}
const fresh = () => ({
  name: '',
  year: '',
  sex: '',
  doctor: '',
  address: '',
  phone: '',
  diagnosis: '',
  note: '',
  sample: 'Huyết thanh',
  time: localTime(),
  received: '',
  status: 0,
  rows: [],
})
const row = (i) => ({ i, value: '', ref: '', flag: '' })
const seed = () =>
  names.map((name, i) => ({
    ...fresh(),
    id: 'XN-' + String(108 - i).padStart(4, '0'),
    name,
    year: 1980 + i,
    sex: i % 2 ? 'Nam' : 'Nữ',
    status: i % 3,
    time:
      localTime().slice(0, 10) +
      'T' +
      ['10:42', '10:28', '10:15', '09:56', '09:41', '09:20', '09:05', '08:52'][
        i
      ],
    rows: [0, 1, 2].map((j) => ({
      ...row(j),
      value: i % 3 === 2 ? String([5, 4, 1][j]) : '',
    })),
  }))
const key = 'lamlab-records-v1'
const format = (t) =>
  t
    ? new Date(t).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'
const storageKey = 'lamlab-workspace-v2'
function loadWorkspace(remote = false) {
  const version = remote ? null : localStorage.getItem(storageKey)
  if (version) return { ...JSON.parse(version), version }
  const blood = [
    ['Bạch cầu (WBC)', 'G/L'],
    ['Hồng cầu (RBC)', 'T/L'],
    ['Hemoglobin (HGB)', 'g/L'],
    ['Hematocrit (HCT)', '%'],
    ['Tiểu cầu (PLT)', 'G/L'],
  ]
  const services = [...tests, ...blood].map(([name, unit], i) => ({
    i,
    name,
    unit,
    group: i < tests.length ? 'Hóa sinh' : 'Huyết học',
    price: i < tests.length ? 35000 : 20000,
  }))
  if (remote) return { records: [], customers: [], services, version: null }
  const saved = localStorage.getItem(key)
  const source = saved ? JSON.parse(saved) : seed()
  const records = source.map((r, n) => ({
    ...r,
    customerId: 'KH-' + r.id,
    sample: !saved && n % 3 === 1 ? 'Máu toàn phần' : r.sample,
    rows: r.rows.map((x) => ({
      ...x,
      ...services[!saved && n % 3 === 1 ? tests.length + x.i : x.i],
    })),
  }))
  return {
    records,
    services,
    customers: records.map((r) => ({
      ...personFrom(r),
      customerId: r.customerId,
    })),
    version: null,
  }
}

export { localTime, fresh, row, format, stages, storageKey, loadWorkspace }
