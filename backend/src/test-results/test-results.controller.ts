import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('test-results')
export class TestResultsController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() list() {
    return (
      this.db
        .read()
        .data?.records.flatMap((r) =>
          r.rows.map((result) => ({
            orderId: r.id,
            customerId: r.customerId,
            ...result,
          })),
        ) ?? []
    )
  }
}
