export class ConstantsReadonly {
    readonly host:string = determineHost();
    readonly logLevel:string = determineLogLevel();
    readonly domain:string = determineTenant();
}

function determineHost() {
    if (process.env.COMPOSER_ENV === "true") return `elasticsearch:${process.env.ELASTICSEARCH_PORT}`;

    if (process.env.NODE_ENV === "INTEGRATION_TEST") return "http://localhost:9400";

    return "http://localhost:9200"
}

function determineLogLevel() {
    if (process.env.ELASTICSEARCH_LOG_LEVEL !== "") return process.env.ELASTICSEARCH_LOG_LEVEL;

    if (process.env.NODE_ENV === "development") return 'trace';

    if (process.env.COMPOSER_ENV === "true") return '';

    return "trace";
}

function determineTenant() {
    if (process.env.NODE_ENV === "development") return 'devel';

    return "EDMONTON"
}