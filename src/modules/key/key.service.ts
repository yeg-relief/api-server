import { Component } from '@nestjs/common';
import { KeyDto } from './key.dto';
import { Client } from "elasticsearch";
import { ClientService } from "../db.elasticsearch/client.service"
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/pluck";
import "rxjs/add/operator/map";
import "rxjs/add/operator/reduce";

@Component()
export class KeyService {
    private readonly INDEX = "master_screener";
    private readonly TYPE = "queries";
    private client: Client;
    private readonly baseParams = {
        index: this.INDEX,
        type: this.TYPE
    };

    constructor(
        private readonly clientService: ClientService
    ) {
        this.client = this.clientService.client;
    }

    create(key: KeyDto): Promise<any> {
        const name = Object.keys(key)[0] || null;

        return this.client.indices.putMapping({
            ...this.baseParams,
            body: {
                properties: {
                    [name]: {
                        type: key[name]['type']  // || "integer"
                    }
                }
            }
        })
            .then(res => res.acknowledged )
            .catch(err => {
                return {
                    "error": "key messed up"
                }
            })
    }

    findAll(): Observable<any> {
        return Observable.fromPromise(this.client.indices.getMapping({
            ...this.baseParams
        }))
            .pluck('master_screener', 'mappings', 'queries', 'properties')
            .map(keyObj => {
                delete keyObj['meta'];
                delete keyObj['query'];
                return keyObj
            })
            .map(obj => {
                const array = [];

                for(const name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        array.push({
                            name,
                            type: obj[name].type
                        })
                    }
                }

                return array
            })
    }
}