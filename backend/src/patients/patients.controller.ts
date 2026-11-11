import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('patients')
export class PatientsController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() list() {
    return this.db.read().data?.customers ?? []
  }
}
