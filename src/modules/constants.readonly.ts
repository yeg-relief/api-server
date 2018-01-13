export class ConstantsReadonly {
    readonly host:string = process.env.NODE_ENV === "INTEGRATION_TEST" ? "http://localhost:9400" : "http://localhost:9200";
    readonly logLevel:string = 'trace';
    private readonly _domain:string = "EDMONTON";
    readonly domain:string = process.env.NODE_ENV === "development" ? "devel" : this._domain
}