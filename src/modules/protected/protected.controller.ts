import { Get, Controller, Param, Body, Post, Put, Delete, Req } from '@nestjs/common';
import { Observable } from "rxjs/Observable"
import { ProgramService } from "../Program/program.service";
import { ApplicationProgramDto } from "./AplicationProgram.dto";
import { ApplicationQueryService } from "../query/ApplicationQuery.service";
import { ApplicationQueryDto } from "../query/ApplicationQuery.dto"
import "rxjs/add/observable/fromPromise"
import "rxjs/add/observable/from"
import "rxjs/add/observable/forkJoin"
import "rxjs/add/operator/map"
import "rxjs/add/observable/zip"
import "rxjs/add/operator/do"
import "rxjs/add/operator/mapTo"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/retry"
import "rxjs/add/observable/concat"
import "rxjs/add/observable/merge"
import "rxjs/add/observable/throw"
import {KeyService} from "../key/key.service";
import {KeyDto} from "../key/key.dto";
import {ProgramDto} from "../Program/program.dto";
import {ScreenerDto} from "../screener/screener.dto";
import {ScreenerService} from "../screener/screener.service";
import { ConstantsReadonly } from "../constants.readonly"
const fs = require('fs');
const path = require('path');

@Controller('protected')
export class ProtectedController {
    private readonly constants = new ConstantsReadonly();

    constructor(
        private programService: ProgramService,
        private queryService: ApplicationQueryService,
        private keyService: KeyService,
        private screenerService: ScreenerService
    ) {}

    writeError(err) {
        fs.writeFileSync(path.resolve(__dirname, "error.json"), JSON.stringify(err));
    }

    @Get('/login/')
    loginAlwaysTrue(): Observable<{[key: string]: boolean}> {
        return Observable.of({created: true})
    }

    @Get('/key/')
    getAllKeys(): Observable<KeyDto[]> {
        return this.keyService.findAll();
    }

    @Post('/key')
    saveKey(@Body() data) {
        return Observable.fromPromise( this.keyService.create(data) )
            .map(updated => ({ update: updated }) )
    }


    @Get('/screener/')
    getScreenerWithKeys(): Observable<{[key:string]: ScreenerDto}> {
        return Observable.zip(
            this.screenerService.getByEnvironmentDomain(),
            this.keyService.findAll()
        ).map( ([screener, keys]) => {
            return {
                response: {
                    questions: screener.questions,
                    created: screener.created,
                    keys: keys
                }
            }
        })
    }

    @Post('/screener/')
    saveScreener(@Body() data) {
        return this.screenerService.update((<ScreenerDto> data), this.constants.domain)
    }

    @Get('/program/')
    getProgramsWithQueries(): Observable<ApplicationProgramDto[]> {
        return Observable.zip(
            this.programService.findAll().retry(3),
            this.queryService.findAll().retry(3)
        ).map(([programs, queries]) => {
            return programs.map( program => {
                return new ApplicationProgramDto(
                    queries.filter(query => query.guid === program.guid),
                    program,
                    program.guid,
                );
            })
        })
    }

    @Get('/program/:guid')
    getProgramWithQueries(@Param() params): Observable<ApplicationProgramDto> {
        const guid = params.guid;
        return Observable.zip(
            this.programService.getByGuid(guid),
            this.queryService.getByGuid(guid)
        ).map( ([program, queries]) => {
            return new ApplicationProgramDto(
                queries,
                program,
                program.guid
            )
        })
            .catch(err => {
                console.error(err);
                return Observable.throw(err);
            })

    }

    @Post('/program/')
    createProgramWithQueries(
        @Body("user") user,
        @Body("application") application,
        @Body("guid") guid,
        @Req() req
    ): any {
        return Observable.zip(
            this.programService.create(user),
            Observable.from(application)
                .mergeMap( (query: ApplicationQueryDto) => this.queryService.create(query))
                .catch(error => Observable.throw(false))
        )
            .map( ([{created}, queriesCreated]) => {
                return created === true && queriesCreated === true ? { created: true} : { created: false }
            })
    }

    @Put('/program/')
    updateProgramWithQueries(@Body() data: any): any {
        return Observable.zip(
            this.programService.index(data.user),
            Observable.from(data.application).mergeMap((query: ApplicationQueryDto) => this.queryService.index(query))
        )
            .map( ([userUpdated, queriesUpdated]) => {
                return userUpdated.created === true && queriesUpdated.created === true ? { updated: true} : { updated: false }
            })
    }

    @Delete('/program/:guid')
    deleteProgramAndQueries(@Param() params): Observable<any> {
        const guid = params.guid;

        return Observable.zip(
            this.programService.deleteByGuid(guid).do(console.log),
            this.queryService.deleteByGuid(guid).do(console.log)
        )
    }

    @Delete('/query/:id')
    deleteQueryById(@Param() params): Observable<any> {
        return this.queryService.deleteById(params.id)
            .map(res => res.created ? {found: true, deleted: true } : { found: null, deleted: false} )
    }

    @Post('/query')
    updateOrCreateQuery(@Body("query") query, @Body("guid") guid): Promise<any> {
        return this.queryService.index({
            ...query,
            guid
        })
    }

    @Put('/program-description/')
    updateUserFacingProgram(@Body() body): Promise<any> {
        const dto: ProgramDto = body.data;
        return this.programService.index(Object.assign({}, dto))
    }
}
