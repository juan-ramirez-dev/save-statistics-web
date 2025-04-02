import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UniqueClickStatisticModule } from './modules/unique-click-statistic/unique-click-statistic.module';
import configuration from './config/configuration';
import { ClickStatisticModule } from './modules/click-statistic/click-statistic.module';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    // Base de datos MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri') || 'mongodb://localhost:27017/save_statistics',
      }),
    }),
    
    // Protección contra ataques de fuerza bruta
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    
    // Módulos de la aplicación
    UserModule,
    AuthModule,
    ClickStatisticModule,
    UniqueClickStatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
