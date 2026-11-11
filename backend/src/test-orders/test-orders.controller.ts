import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('test-orders')
export class TestOrdersController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() list() {
    return this.db.read().data?.records ?? []
  }
}
