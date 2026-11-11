import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth/auth.guard'
import { WorkspaceService } from './workspace/workspace.service'
import { WorkspaceController } from './workspace/workspace.controller'
import { PatientsController } from './patients/patients.controller'
import { TestOrdersController } from './test-orders/test-orders.controller'
import { TestResultsController } from './test-results/test-results.controller'
import { ReportsController } from './reports/reports.controller'

@Module({
  controllers: [
    WorkspaceController,
    PatientsController,
    TestOrdersController,
    TestResultsController,
    ReportsController,
  ],
  providers: [WorkspaceService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
