import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

interface Service {
  i: number
  name: string
  unit: string
  group: string
  price: number
}
interface Result extends Service {
  value: string
  ref: string
  flag: string
}
interface Patient {
  customerId: string
  name: string
}
interface Order extends Patient {
  id: string
  time: string
  status: number
  rows: Result[]
  payment?: { amount: number; time: string; method: string }
}
interface Data {
  customers: Patient[]
  records: Order[]
  services: Service[]
}
interface Snapshot {
  version: string | null
  data: Data | null
}

function validService(s: Service) {
  return (
    s &&
    Number.isInteger(s.i) &&
    typeof s.name === 'string' &&
    typeof s.unit === 'string' &&
    ['Hóa sinh', 'Huyết học'].includes(s.group) &&
    Number.isSafeInteger(s.price) &&
    s.price >= 0
  )
}
function valid(d: Data) {
  if (
    !d ||
    !Array.isArray(d.customers) ||
    !Array.isArray(d.records) ||
    !Array.isArray(d.services)
  )
    return false
  const ids = new Set(d.customers.map((c) => c?.customerId))
  return (
    ids.size === d.customers.length &&
    d.customers.every(
      (c) =>
        c && typeof c.customerId === 'string' && typeof c.name === 'string',
    ) &&
    d.services.every((s, i) => validService(s) && s.i === i) &&
    new Set(d.records.map((r) => r?.id)).size === d.records.length &&
    d.records.every(
      (r) =>
        r &&
        typeof r.id === 'string' &&
        typeof r.name === 'string' &&
        typeof r.time === 'string' &&
        ids.has(r.customerId) &&
        [0, 1, 2].includes(r.status) &&
        Array.isArray(r.rows) &&
        r.rows.length > 0 &&
        r.rows.every(
          (x) =>
            validService(x) &&
            d.services[x.i] &&
            typeof x.value === 'string' &&
            typeof x.ref === 'string' &&
            typeof x.flag === 'string' &&
            (r.status !== 2 || x.value.trim()),
        ) &&
        (!r.payment ||
          (typeof r.payment.time === 'string' &&
            typeof r.payment.method === 'string' &&
            r.payment.amount === r.rows.reduce((n, x) => n + x.price, 0))),
    )
  )
}

@Injectable()
export class WorkspaceService {
  private readonly path = resolve(
    process.env.LIS_DATA_FILE || 'data/workspace.json',
  )
  private state: Snapshot = existsSync(this.path)
    ? JSON.parse(readFileSync(this.path, 'utf8'))
    : { version: null, data: null }
  read() {
    return this.state
  }
  save(input: Snapshot) {
    if (!input || !input.data || !valid(input.data))
      throw new BadRequestException('Dữ liệu phiếu hoặc danh mục không hợp lệ.')
    if (input.version !== this.state.version)
      throw new ConflictException('Dữ liệu đã thay đổi. Hãy tải lại trang.')
    const next = { version: randomUUID(), data: input.data }
    mkdirSync(dirname(this.path), { recursive: true })
    writeFileSync(this.path + '.tmp', JSON.stringify(next), { mode: 0o600 })
    renameSync(this.path + '.tmp', this.path)
    this.state = next
    return { version: next.version }
  }
}
