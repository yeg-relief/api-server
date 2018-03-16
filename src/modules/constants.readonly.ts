const determineHost = () => {
    if (process.env.NODE_ENV === "INTEGRATION_TEST") return "http://localhost:9400";

    if (process.env.COMPOSER_ENV === "true") return `elasticsearch:${process.env.ELASTICSEARCH_PORT}`;

    return "http://localhost:9200"
};


export class ConstantsReadonly {
    readonly host:string = determineHost();
    readonly logLevel:string = 'trace';
    private readonly _domain:string = "EDMONTON";
    readonly domain:string = process.env.NODE_ENV === "development" ? "devel" : this._domain
}