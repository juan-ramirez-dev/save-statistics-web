import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueClickStatistic, UniqueClickStatisticSchema } from './schemas/unique-click-statistic.schema';
import { UniqueClickStatisticService } from './services/unique-click-statistic.service';
import { UniqueClickStatisticController } from './controllers/unique-click-statistic.controller';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UniqueClickStatistic.name, schema: UniqueClickStatisticSchema },
    ]),
    UserModule,
  ],
  controllers: [UniqueClickStatisticController],
  providers: [UniqueClickStatisticService],
  exports: [UniqueClickStatisticService],
})
export class UniqueClickStatisticModule {} 