import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';
import { CategoryModule } from './category/category.module';
import { RequestsModule } from './requests/requests.module';
import { NewsModule } from './news/news.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryEventsModule } from './library-events/library-events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import appConfig from './app.config';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EditorChoicesModule } from './editor-choices/editor-choices.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validationSchema: Joi.object({
        DATABASE_TYPE: Joi.required(),
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.required(),
        DATABASE_DATABASE: Joi.required(),
        DATABASE_PASSWORD: Joi.required(),
        DATABASE_AUTOLOADENTITIES: Joi.number().min(0).max(1).default(0),
        DATABASE_SYNCHRONIZE: Joi.number().min(0).max(1).default(0),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get<'postgres'>('database.type'),
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          database: configService.get<string>('database.database'),
          password: configService.get<string>('database.password'),
          autoLoadEntities: configService.get<boolean>(
            'database.autoLoadEntities',
          ),
          synchronize: configService.get<boolean>('database.synchronize'),
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'pictures'),
      serveRoot: '/pictures',
    }),
    LibraryEventsModule,
    BooksModule,
    LoansModule,
    CategoryModule,
    RequestsModule,
    NewsModule,
    UsersModule,
    AuthModule,
    EditorChoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
