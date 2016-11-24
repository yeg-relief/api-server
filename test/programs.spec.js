const
chai      = require('chai'),
chaiHttp  = require('chai-http');

chai.use(chaiHttp);
// Integration tests

const HOST = 'http://localhost:3000';

it('a get request at the Programs index returns an array and a 200 response', function(done) {
  chai.request(HOST)
  .get('/programs/')
  .end(function(err, res) {
    chai.expect(res).to.have.status(200);
    chai.expect(res.body.programs).to.exist;
    chai.expect(res.body.programs instanceof Array).to.equal(true);
    done();
  });
});

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
