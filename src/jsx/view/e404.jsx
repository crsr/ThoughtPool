'use strict'

/******************************* Dependencies ********************************/

// Third party
var React = require('react/addons'),
    Link  = require('react-router').Link

/******************************** Components *********************************/

var e404 = React.createClass({

  render: function() {return (

<div className='container'>
  <h1 className='text-muted'>Sorry, page not found.</h1>
  <p className='lead'><Link to='/'>→ Back to index</Link></p>
</div>

  )}

})

/********************************** Export ***********************************/

module.exports = e404
