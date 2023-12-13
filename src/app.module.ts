import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: ConfigService.get('DB_PORT'),
        username: ConfigService.get('DB_USERNAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_SCHEMA'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: ConfigService.get<boolean>('TYPEORM_SYBCHRONIZE'),
      }),
    }),
    UserModule,
    ConfigurationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
