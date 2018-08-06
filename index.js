'use strict';
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

/* HELLO WORLD */
router.get('/hello-world', function (req, res) {
  res.send('Hello World!');
})
.response(['text/plain'], 'A generic greeting.')
.summary('Generic greeting')
.description('Prints a generic greeting.');


const joi = require('joi');

/* HELLO [INSERT NAME] */
router.get('/hello/:name', function (req, res) {
  res.send(`Hello ${req.pathParams.name}`);
})
.pathParam('name', joi.string().required(), 'Name to greet.')
.response(['text/plain'], 'A personalized greeting.')
.summary('Personalized greeting')
.description('Prints a personalized greeting.');

/* SUM FUNCTION */
router.post('/sum', function (req, res) {
  const values = req.body.values;
  res.send({
    result: values.reduce(function (a, b) {
      return a + b;
    }, 0)
  });
})
.body(joi.object({
  values: joi.array().items(joi.number().required()).required()
}).required(), 'Values to add together.')
.response(joi.object({
  result: joi.number().required()
}).required(), 'Sum of the input values.')
.summary('Add up numbers')
.description('Calculates the sum of an array of number values.');

/* DB INTERACTION */
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const quotesColl = db._collection('Quotes');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;


router.get('/entries', function (req, res) {
  try {
    const data = db._query('FOR q IN Quotes FOR v IN 1..2 OUTBOUND q._id GRAPH \'Wisdom\' RETURN {quote: q.text, attribution: v.name}').toArray();
    // const data = db._query(aql`
    //   FOR q IN ${quotesColl}
    //   RETURN q
    // `);
    res.send(data)
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Fetched all quotes from the collection.')
.summary('Retrieve quotes')
.description('Retrieves all quotes and associated attributions from the respective collections.');
