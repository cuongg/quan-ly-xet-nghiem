import { Controller, Get, Put, Body } from '@nestjs/common'
import { WorkspaceService } from './workspace.service'
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() read() {
    return this.db.read()
  }
  @Put() save(@Body() input: Parameters<WorkspaceService['save']>[0]) {
    return this.db.save(input)
  }
}
