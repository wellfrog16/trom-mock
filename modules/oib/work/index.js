const express = require('express');
const moment = require('moment');
const getDb = require('../../../models/oib/getDb');
const guidDb = require('../../../models/oib/guid');
const handleErr = require('../../../utils/handleErr');
const handleSuccess = require('../../../utils/handleSuccess');
const getIdQuery = require('../../../utils/getIdQuery');
const router = express.Router();

const db = getDb.work;
const brandDb = getDb.customer;

router.get('/works', (req, res, next) => {
  console.log('\n=============================');
  console.log(req.route.stack[0].method, req.route.path, 'success');
  db.find({}).skip(req.query.page - 1).limit(req.query.rows).exec(handleErr(res, (content) => {
    db.count({}, handleErr(res, (totalElements) => {
      handleSuccess(res)({
        totalElements,
        content
      });
    }));
  }));
});

// id只能为数字
router.get('/work/:id(\\d+)', function(req, res, next) {
  console.log('\n=============================');
  console.log(req.route.stack[0].method, req.route.path, 'success');
  db.findOne(getIdQuery(req), handleErr(res, handleSuccess(res)));
});

router.put('/work/:id(\\d+)', function(req, res, next) {
  console.log('\n=============================');
  console.log(req.route.stack[0].method, req.route.path, 'success');
  db.update(getIdQuery(req), {
    $set: Object.assign({}, req.body, {
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    })
  }, { returnUpdatedDocs: true }, handleErr(res, handleSuccess(res, null, 1)));
});

router.post('/work', function(req, res, next) {
  console.log('\n=============================');
  console.log(req.route.stack[0].method, req.route.path, 'success');
  guidDb.getGuid('work', res).then((id) => {
    var result = Object.assign({}, req.body, {
      id,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    db.insert(result, handleErr(res, (data) => {
      console.log('lll', data);
      brandDb.update(
        { id: +data.brand },
        { $addToSet: { serviceTags: { $each: data.services } } },
        { returnUpdatedDocs: true },
        handleErr(res, (reddd) => {
          console.log('kkk', reddd);
          res.json({
            code: 200,
            msg: '',
            data
          });
        })
      );
      brandDb.find({}, (err, data) => {
        console.log('ddd', data);
      });
    }));
  });
});

router.delete('/work/:id(\\d+)', function(req, res, next) {
  console.log('\n=============================');
  console.log(req.route.stack[0].method, req.route.path, 'success');
  db.remove(getIdQuery(req), handleErr(res, handleSuccess(res)));
});

module.exports = router;