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
it('will percolate a user submitted master screener data', function(done) {
  const mockMasterScreener = {
    data: {
      age: 10
    }
  };


  chai.request(HOST)
    .post('/userMasterScreener/')
    .send(mockMasterScreener)
    .end(function(err, res){
      chai.expect(res).to.have.status(200);

      done();
    });
});
*/
