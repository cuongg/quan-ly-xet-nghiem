import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('reports')
export class ReportsController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() list() {
    const records = this.db.read().data?.records ?? []
    return {
      orders: records.length,
      completed: records.filter((r) => r.status === 2).length,
      collected: records.reduce((sum, r) => sum + (r.payment?.amount ?? 0), 0),
    }
  }
}
