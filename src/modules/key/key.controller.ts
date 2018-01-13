import { Get, Controller, Body, Put } from '@nestjs/common';
import { KeyService } from "./key.service";
import { KeyDto } from "./key.dto";
import { Observable } from "rxjs/Observable"
import "rxjs/add/observable/fromPromise"
import "rxjs/add/operator/retry"


@Controller('key')
export class KeyController {

    constructor(private service: KeyService) {}

    @Get()
    root(): Observable<any> {
        return this.service.findAll()
            .retry(3)
    }

    @Put()
    create(@Body() data: KeyDto): Observable<any> {
        return Observable.fromPromise( this.service.create(data) )
            .retry(3)
    }
}
