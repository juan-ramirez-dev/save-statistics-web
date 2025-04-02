import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClickStatistic, ClickStatisticSchema } from './schemas/click-statistic.schema';
import { ClickStatisticService } from './services/click-statistic.service';
import { ClickStatisticController } from './controllers/click-statistic.controller';
import { UserModule } from '../user/user.module';
import { UniqueClickStatisticModule } from '../unique-click-statistic/unique-click-statistic.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClickStatistic.name, schema: ClickStatisticSchema },
    ]),
    UserModule,
    UniqueClickStatisticModule,
  ],
  controllers: [ClickStatisticController],
  providers: [ClickStatisticService],
  exports: [ClickStatisticService],
})
export class ClickStatisticModule {} 