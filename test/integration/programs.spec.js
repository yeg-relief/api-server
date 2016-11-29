const
chai      = require('chai'),
chaiHttp  = require('chai-http');

chai.use(chaiHttp);
const HOST = 'http://localhost:3000';
/*
it('an empty put request at the programs index returns 400 and an error message', function(done) {
  chai.request(HOST)
    .post('/programs/')
    .end(function(err, res) {
      chai.expect(res).to.have.status(400);
      chai.expect(res.body.message).to.exist;
      chai.expect(res.body.message).to.equal('programs are undefined');
      done();
    });
});
*/
it('can register a query for a new program', function(done) {
  const mockProgram = {
    guid: 'new',
    application: [
      {
        guid: 'new',
        conditions: [
          {
            key: {
              name: 'age',
              type: 'number'
            },
            value: 10,
            qualifier: 'equal',
            type: 'number'
          }
        ]
      }
    ],
    user: {
      guid: 'new',
      description: {
        guid: 'new',
        title: 'a test program',
        details: 'this is just a test to see if i can upload a new program',
        externalLink: 'http://test.not.real.address'
      },
      created: '',
      tags: [
        'test',
        'fake'
      ]
    }
  };

  chai.request(HOST)
    .post('/programs/')
    .send(mockProgram)
    .end(function(err, res){
      // expect no error
      chai.expect(res).to.have.status(200);
      done();
    });
});
