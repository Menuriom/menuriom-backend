import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { SessionSchema } from "./models/sessions.schema";
import { TagSchema } from "./models/tags.schema";
import { TechAndToolSchema } from "./models/techAndTools.schema";
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env .MONGO_URL, { dbName: process.env.MONGO_DB }),
        MongooseModule.forFeature([
            { name: "Session", schema: SessionSchema },
            { name: "Tag", schema: TagSchema },
            { name: "TechAndTool", schema: TechAndToolSchema },
        ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
