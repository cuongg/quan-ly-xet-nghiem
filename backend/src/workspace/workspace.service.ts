import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import {existsSync,readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {Pool} from 'pg'
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
  private readonly pool = new Pool({connectionString:process.env.DATABASE_URL, max:5, connectionTimeoutMillis:5000})

  async onModuleInit() {
    if(!process.env.DATABASE_URL) throw new Error('Cần cấu hình DATABASE_URL cho PostgreSQL.')
    await this.pool.query(`CREATE TABLE IF NOT EXISTS lamlab_workspace (
      id smallint PRIMARY KEY CHECK (id = 1),
      version uuid,
      data jsonb,
      CHECK ((version IS NULL) = (data IS NULL))
    )`)
    // Bootstrap once, preserving a previous server's snapshot and revision.
    const existing = await this.pool.query('SELECT id FROM lamlab_workspace WHERE id = 1')
    if(existing.rowCount) return
    const file = resolve(process.env.LIS_DATA_FILE || 'data/workspace.json')
    let initial:Snapshot = {version:null,data:null}
    if(existsSync(file)){
      initial = JSON.parse(readFileSync(file,'utf8'))
      if(!initial?.version || !initial.data || !valid(initial.data)) throw new Error('Tệp dữ liệu cũ không hợp lệ.')
    }
    await this.pool.query(
      'INSERT INTO lamlab_workspace (id,version,data) VALUES (1,$1,$2) ON CONFLICT DO NOTHING',
      [initial.version, initial.data],
    )
  }

  async onModuleDestroy(){await this.pool.end()}

  async read():Promise<Snapshot>{
    const {rows}=await this.pool.query<Snapshot>('SELECT version,data FROM lamlab_workspace WHERE id=1')
    return rows[0]
  }

  async save(input:Snapshot){
    if(!input || !input.data || !valid(input.data)) throw new BadRequestException('Dữ liệu phiếu hoặc danh mục không hợp lệ.')
    const version=randomUUID()
    const result=await this.pool.query(
      'UPDATE lamlab_workspace SET version=$1, data=$2 WHERE id=1 AND version::text IS NOT DISTINCT FROM $3 RETURNING version',
      [version,input.data,input.version],
    )
    if(!result.rowCount) throw new ConflictException('Dữ liệu đã thay đổi. Hãy tải lại trang.')
    return {version}
  }
}
