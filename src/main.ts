import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // TODO
    // await createDefaultFilesAndFolders();

    // added validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: 422,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                return new UnprocessableEntityException(
                    errors.map((item) => {
                        return {
                            property: item.property,
                            errors: Object.values(item.constraints),
                        };
                    }),
                );
            },
        }),
    );

    // added cookie parser
    app.use(cookieParser());

    // setup helmet for http headers
    app.use(helmet());

    // make CORS happen
    app.enableCors({ origin: process.env.FRONT_URL });

    // set the timezone
    process.env.TZ = "Asia/Tehran";

    await app.listen(process.env.PORT);
}
bootstrap();
