import {Controller, Post, Body} from '@nestjs/common';
import {NotificationService} from "./notification.service";
import {ProgramDto} from "../Program/program.dto";
import {Observable} from "rxjs/Observable";

@Controller()
export class NotificationController {

    constructor(private readonly service: NotificationService) {}

    @Post()
    root(@Body() data: {[key: string]: number | boolean}): Observable<ProgramDto[]> {
        return this.service.percolate(data)
    }
}
