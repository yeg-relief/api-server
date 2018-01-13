import { Get, Controller, Param, Body, Post, Put } from '@nestjs/common';
import { ProgramService } from "./program.service";
import { ProgramDto } from "./program.dto";
import { Observable } from "rxjs/Observable"
import "rxjs/add/observable/fromPromise"
import "rxjs/add/operator/retry"


@Controller('program')
export class ProgramController {

    constructor(private service: ProgramService) {}

    @Get()
    root(): Observable<ProgramDto[]> {
        return this.service.findAll().retry(3)
    }

    @Get(':guid')
    findOne(@Param() params): Observable<ProgramDto> {
        return Observable.fromPromise( this.service.getByGuid(params.guid) )
            .retry(3)
    }

    @Post()
    findMany(@Body() data: {[key: string]: string[]}): Observable<ProgramDto[]> {
        return Observable.fromPromise( this.service.mGetByGuid(data.guids) )
            .retry(3)
    }

    @Put()
    create(@Body() data: ProgramDto): Observable<any> {
        return Observable.fromPromise( this.service.create(data) )
            .retry(3)
    }
}
