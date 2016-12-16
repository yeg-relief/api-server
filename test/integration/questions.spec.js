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
it('can get all programs', function(done) {
  chai.request(HOST)
    .get('/api/questions/')
    .end(function(err, res) {
      chai.expect(res).to.have.status(200);
      console.log(res.body);
      done();
    });

});

it('an empty put request at the programs index returns 400 and an error message', function(done) {
  const mockScreener = {
    version: 1,
    meta: {
      screener: {
        version: 1,
        created: 51515511
      },
      questions: {
        totalCount: 5,
      }
    },
    questions: [
      {
        type: 'number',
        key: 'age',
        label: 'age',
        expandable: false,
        controlType: 'input',
        options: [],
        conditonalQuestions: []
      }
    ]
  };

  chai.request(HOST)
    .post('/api/questions/')
    .send(mockScreener)
    .end(function(err, res) {
      //chai.expect(res).to.have.status(500);
      console.log(res.body);
      done();
    });
});


it('can get a master screener with a specific version', function(done) {
  chai.request(HOST)
    .get('/api/questions/version/3')
    .end(function(err, res) {
      chai.expect(res).to.have.status(200);
      console.log(res.body);
      done();
    });
});
*/