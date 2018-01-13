const request = require("supertest");
import { instance } from "../../src/server"
const uuidv4 = require('uuid/v4');



describe("/", () => {
    it("GET should return 'hello world'", done => {
        return request(instance)
            .get("/")
            .expect(200)
            .end( (err, response) => {
                if (err) throw err;
                expect(response.text).toMatchSnapshot();
                done();
            });
    });
});


describe("/protected", () => {

    it(" GET /program will return all programs and their queries", done => {
        return request(instance)
            .get("/protected/program/")
            .expect(200)
            .end( (err, response) => {
                if (err) throw err;

                const extractedProperties = response.body.map( applicationProgramDto => applicationProgramDto.guid);
                extractedProperties.sort( (a, b) => a.localeCompare(b));

                expect(extractedProperties).toMatchSnapshot();
                done();
            })


    });

    describe("GET /program/:guid", () => {

        it("will return a single program and it's queries", done => {
            return request(instance)
                .get("/protected/program/hp5mupqcVY8ZMiKg7Q91Uoi4Wf")
                .expect(200)
                .end( (err, response) => {
                    if (err)  {
                        console.error(err);
                        throw err;
                    }

                    const applicationProgramDto = response.body;

                    const extractedProps = {
                        guid: applicationProgramDto.guid,
                        user: applicationProgramDto.user,
                        queries: applicationProgramDto.application.map(query => query.id)
                    };

                    extractedProps.queries.sort( (a, b) => a.localeCompare(b));
                    expect(extractedProps).toMatchSnapshot();
                    expect(applicationProgramDto.application.some(query => query.guid !== extractedProps.guid)).toBe(false);
                    expect(applicationProgramDto.application.length).toBe(9);
                    done();
                })
        })

    });


    const guid = uuidv4();
    const id = uuidv4();
    const data =  {
        "user": {
            "created": 0,
            "description": "test POST /protected/program/",
            "details": "test POST /protected/program/",
            "externalLink": "test POST /protected/program/",
            "guid": guid,
            "tags": [
                "test POST /protected/program/"
            ],
            "title": "test POST /protected/program/"
        },
        "guid": guid,
        "application": [
            {
                "guid": guid,
                "id": guid,
                "conditions": [
                    {
                        "key": {
                            "name": "empoyment",
                            "type": "boolean"
                        },
                        "qualifier": "equal",
                        "value": true
                    }
                ]
            }
        ]
    };

    it("POST /program/ will create a new program and the queries", done => {
        return request(instance)
            .post("/protected/program/")
            .set('Content-Type', 'application/json')
            .send(data)
            .expect(201)
            .end( (err, response) => {
                if (err)  {
                    console.error(err);
                    throw err;
                }
                expect(response.body).toMatchSnapshot();
                done();
            })

    });

    it(`POST /program/ was successfully created, GET /protected/program/${guid}`, done => {
        return request(instance)
            .get(`/protected/program/${guid}`)
            .expect(200)
            .end( (err, response) => {
                if (err)  {
                    console.error(err);
                    throw err;
                }
                expect(response.body).toMatchSnapshot();
                done();
            })

    });
});

