const
chai      = require('chai'),
chaiHttp  = require('chai-http');

chai.use(chaiHttp);
const HOST = 'http://localhost:3000';

// THESE TESTS ARE A WIP AND ARE NOT STATE INDEPENDENT
// ie, I HAVE TO ENSURE THAT THE ES SERVER HAS A PATICULAR STATE
// TRY TO THINK OF THESE AS EXPLORATORY TESTS BUT AT SOME POINT THEY WILL
// SET THE STATE OF ES THEMSELVES.

/*
it('a get request at the keys index returns 200 and a keys array', function(done) {
  chai.request(HOST)
    .get('/keys/')
    .end(function(err, res) {
      chai.expect(res).to.have.status(200);
      console.log(res.body);
      chai.expect(res.body.keys).to.exist;
      chai.expect(res.body.keys instanceof Array).to.equal(true);
      done();
    });
});

it('an empty put request at the keys index returns 400 and an error message', function(done) {
  chai.request(HOST)
    .post('/keys/')
    .end(function(err, res) {
      chai.expect(res).to.have.status(400);
      chai.expect(res.body.message).to.exist;
      chai.expect(res.body.message).to.equal('keys are undefined');
      done();
    });
});
*/
