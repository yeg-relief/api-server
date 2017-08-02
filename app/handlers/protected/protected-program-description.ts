import { ProgramCache } from '../../cache';
import { UserProgramRecord } from '../../models';

export class ProgramDescriptionHandler {


  constructor(
    private client: Elasticsearch.Client,
    private programCache: ProgramCache
  ) {}

  private _createProgram(program){
    const p = JSON.parse(program);
    p.created = Date.now();
    const params = {
      index: 'programs',
      type: 'user_facing',
      id: p.guid,
      body: p
    };
    return this.client.create(params)
    .then(response => {
      console.log(response);
      if (response.result === 'updated' || response.created) {
        return Promise.resolve(response)
      }
      return Promise.reject(`program with ${p.guid}: [failed create]`)
    })
    .catch(e => {
      console.log('WHAT I"M HERER OMOEMOEMFOE');
      console.log(e)
    })
  }

  private _updateProgram(program){
    const p = JSON.parse(program);
    p.created = Date.now();
    const params: Elasticsearch.IndexDocumentParams<any> = {
      index: 'programs',
      type: 'user_facing',
      id: p.guid,
      body: p
    };
    return this.client.index(params)
    .then(response => {
      console.log(response);
      if (response.result === 'updated' || response.created) {
        return Promise.resolve(response)
      }
      return Promise.reject(`program with ${p.guid}: [failed create]`)
    })
    .catch(e => {
      console.log('WHAT I"M HERER OMOEMOEMFOE');
      console.log(e)
    })
  }


  create() {
    const bleh = async (req, res) => {
      this.setupResponse(res);
      const program  = req.body.data;
      try {
        const created = await this._createProgram(program);
        if (created) {
          this.programCache.updatePrograms([new UserProgramRecord(JSON.parse(program), this.client)])
        }

        res.end(JSON.stringify(created));

      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.end(JSON.stringify( e ));

      }
    };

    return (req, res) => {
      bleh(req, res).then();
    }
  }

  update() {
    const bleh = async (req, res) => {
      this.setupResponse(res);
      const program  = req.body.data;
      try {
        const created = await this._updateProgram(program);
        if (created) {
          this.programCache.updatePrograms([new UserProgramRecord(JSON.parse(program), this.client)])
        }
        res.end(JSON.stringify(created));

      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.end(JSON.stringify( e ));

      } 
    };

    return (req, res) => {
      bleh(req, res).then();
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }



}