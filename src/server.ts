import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';
import * as express from 'express';
const bodyParser = require('body-parser');

const instance = express();

async function bootstrap() {
	const app = await NestFactory.create(ApplicationModule, instance);
	app.use(bodyParser.urlencoded({
        extended: true
    }));
	app.use(bodyParser.json());

    instance.use(bodyParser.urlencoded({
        extended: true
    }));
    instance.use(bodyParser.json());


    await app.listen(3000);
}
bootstrap();

export { instance }
