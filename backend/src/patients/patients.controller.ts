import { Controller, Get } from '@nestjs/common'
import { WorkspaceService } from '../workspace/workspace.service'
@Controller('patients')
export class PatientsController {
  constructor(private readonly db: WorkspaceService) {}
  @Get() async list() {
    return (await this.db.read()).data?.customers ?? []
  }
}
