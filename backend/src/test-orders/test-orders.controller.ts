import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('test-orders')
export class TestOrdersController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() async list() {
    return (await this.db.read()).data?.records ?? []
  }
}
