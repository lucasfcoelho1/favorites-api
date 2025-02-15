import { Module } from '@nestjs/common'

@Module({
  providers: [DatabaseModule],
  exports: [],
})
export class DatabaseModule {}
