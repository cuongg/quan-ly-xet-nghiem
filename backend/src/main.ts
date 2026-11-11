import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'

async function main() {
  if (!process.env.LIS_API_TOKEN?.trim())
    throw new Error('Cần cấu hình LIS_API_TOKEN để chạy API.')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  })
  app.useBodyParser('json', { limit: '8mb' })
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: process.env.LIS_FRONTEND_ORIGIN || 'http://localhost:5173',
  })
  await app.listen(
    Number(process.env.PORT || 3000),
    process.env.HOST || '127.0.0.1',
  )
}
void main()
