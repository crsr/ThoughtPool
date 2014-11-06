'use strict'

/******************************* Dependencies ********************************/

// Third party
var router = require('express').Router(),
    _      = require('lodash')

var utils  = require('app/route-utils'),
    Place  = require('app/model/place')

/********************************** Routing **********************************/

/*----------------------------------- GET -----------------------------------*/

// GET all
router.get('/', function (req, res, next) {
  Place.findAsync()
  .then(res.sendDocs())
  .catch(res.xerr(404))
})

// GET by :_id
router.get('/:_id', function (req, res) {
  Place.findOneAsync(req.params)
  .then(res.sendDoc())
  .catch(res.xerr(404))
})

/*---------------------------------- POST -----------------------------------*/

// All POST requests must have a body
router.post('*', utils.nonEmpty)

// POST /
router.post('/', function (req, res) {
  Place.createAsync(req.body)
  .then(function (place) {
    res.xsend(place, 'Successfully created a place.')
  })
  .catch(res.xerr(422))
})

/*----------------------------------- PUT -----------------------------------*/

// PUT :_id
router.put('/:_id', utils.nonEmpty, function (req, res) {
  Place.findOneAsync(req.params)
  .then(function (place) {
    _.assign(place, req.body)
    return place.saveAsync()
  })
  .spread(function (place) {
    res.xsend(place, 'Successfully updated the place.')
  })
  .catch(res.xerr(400))
})

// PUT :_id/warmup
router.put('/:_id/warmup', function (req, res) {
  Place.findOneAsync(req.params)
  .then(function (place) {
    _.assign(place, req.body)
    return place.saveAsync()
  })
  .spread(function (place) {
    return place.warmUp()
  })
  .spread(function (place) {
    res.xsend(place, 'Successfully changed the climate.')
  })
  .catch(res.xerr(404))
})

// PUT :_id/cooldown
router.put('/:_id/cooldown', function (req, res) {
  Place.findOneAsync(req.params)
  .then(function (place) {
    _.assign(place, req.body)
    return place.saveAsync()
  })
  .spread(function (place) {
    return place.coolDown()
  })
  .spread(function (place) {
    res.xsend(place, 'Successfully changed the climate.')
  })
  .catch(res.xerr(404))
})

/*--------------------------------- DELETE ----------------------------------*/

// DELETE :_id
router.delete('/:_id', function (req, res) {
  Place.findOneAsync(req.params)
  .then(res.exist())
  .then(function (place) {
    return place.removeAsync()
  })
  .then(function (place) {
    res.xsend(place, 'Deleted the place.')
  })
  .catch(res.xerr(400))
})

/*-------------------------------- Catch-All --------------------------------*/

router.all('*', utils.undefinedMethod)

/********************************** Export ***********************************/

module.exports = router
