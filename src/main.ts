import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import createDefaultFilesAndFolders from "./createDefaultFilesAndFolders";
import { I18nValidationExceptionFilter, I18nValidationPipe, i18nValidationErrorFactory } from "nestjs-i18n";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    await createDefaultFilesAndFolders();

    // added validation pipe
    app.useGlobalPipes(
        new I18nValidationPipe({
            errorHttpStatusCode: 422,
            stopAtFirstError: true,
        }),
    );
    app.useGlobalFilters(
        new I18nValidationExceptionFilter({
            errorHttpStatusCode: 422,
            errorFormatter: (errors) =>
                errors.map((item) => {
                    return { property: item.property, errors: Object.values(item.constraints) };
                }),
        }),
    );

    // TODO : make a function or middleware or some sort of filter to pass all user inputs throw number filter to conver all arabic numbers to english

    // TODO : add rate-limiting for the end points and such

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
