const
chai      = require('chai'),
chaiHttp  = require('chai-http');

chai.use(chaiHttp);
const HOST = 'http://localhost:3000';


// THESE TESTS ARE A WIP AND ARE NOT STATE INDEPENDENT
// ie, I HAVE TO ENSURE THAT THE ES SERVER HAS A PATICULAR STATE
// TRY TO THINK OF THESE AS EXPLORATORY TESTS AT SOME POINT THEY WILL
// SET THE STATE OF ES THEMSELVES, BUT I HAVE MANY THINGS TO DO RIGHT NOW
// TO BE EXPLICIT THE MASTER_SCREENER/SCREENER NEEDS A AGE MAPPING OF TYPE NUMBER

// IF YOU THINK THIS MAKES ME A BAD PROGRAMMER THEN FIGHT ME IRL LUL


/*
it('an empty put request at the programs index returns 400 and an error message', function(done) {
  chai.request(HOST)
    .post('/programs/')
    .end(function(err, res) {
      chai.expect(res).to.have.status(400);
      chai.expect(res.body.message).to.exist;
      chai.expect(res.body.message).to.equal('program is not well formed');
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
      created: '',
      tags: [
        'test',
        'fake'
      ],
      title: 'a fake program',
      details: 'this is a fake program to upload',
      externalLink: 'http://website.ca'
    }
  };

  chai.request(HOST)
    .post('/programs/')
    .send(mockProgram)
    .end(function(err, res){
      // expect no error
      console.log(res.message);
      chai.expect(res).to.have.status(200);
      done();
    });
});
