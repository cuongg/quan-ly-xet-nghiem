import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { createHash, timingSafeEqual } from 'node:crypto'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const actual =
      context.switchToHttp().getRequest().headers.authorization ?? ''
    const digest = (text: string) => createHash('sha256').update(text).digest()
    if (
      !timingSafeEqual(
        digest(actual),
        digest('Bearer ' + process.env.LIS_API_TOKEN),
      )
    ) {
      throw new UnauthorizedException()
    }
    return true
  }
}
