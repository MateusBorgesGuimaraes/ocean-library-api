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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mateus123',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    LibraryEventsModule,
    BooksModule,
    LoansModule,
    CategoryModule,
    RequestsModule,
    NewsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
