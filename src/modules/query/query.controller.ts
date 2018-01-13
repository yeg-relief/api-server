import { Get, Controller, Param, Body, Post, Put } from '@nestjs/common';
import { ApplicationQueryDto } from "./ApplicationQuery.dto";
import { ApplicationQueryService } from "./ApplicationQuery.service";
import { Observable } from "rxjs/Observable"
import "rxjs/add/observable/fromPromise"
import "rxjs/add/operator/retry"


@Controller('query')
export class QueryController {

    constructor(private service: ApplicationQueryService) {}

    @Get()
    root(): Observable<ApplicationQueryDto[]> {
        return this.service.findAll()
            .retry(3)
    }

    @Get(':guid')
    findOne(@Param() params): Observable<ApplicationQueryDto[]> {
        return this.service.getByGuid(params.guid).retry(3)
    }

    @Post()
    findMany(@Body() data: {[key: string]: string[]}): Observable<ApplicationQueryDto[]> {
        return this.service.mGetByGuid(data.guids)
            .retry(3)
    }

    @Put()
    create(@Body() data: ApplicationQueryDto): Observable<any> {
        return Observable.fromPromise( this.service.create(data) )
            .retry(3)
    }
}
