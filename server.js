'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const server = express();
const pg = require('pg');
const PORT = process.env.PORT;
server.use( cors() );

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));

server.get('/', (request, response) => {
  console.log(request);
  response.status(200).send('HOME PAGE');
});

server.get('/location', search);


function search(request, response) {
    let query = request.query.data;
    let sql = `SELECT * FROM locations WHERE search_query=$1;`;
    let values = [query];
      client.query(sql, values)
      .then(result => {
        if (result.rowCount > 0) {
          response.send(result.rows[0]);
        } else {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
          superagent.get(url)
            .then(result => {
              if (!result.body.results.length) {
                throw 'NO DATA';
              } else {
                let location = new Location(query, result.body.results[0]);
                let newSQL = `INSERT INTO locations (search_query, formatted_address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING ID;`;
                let newValues = Object.values(location);
                client.query(newSQL, newValues)
                  .then(data => {
                    location.id = data.rows[0].id;
                    response.send(location);
                  });
              }
            })
            .catch(error => handleError(error, response));
        }
      });
  }
  
  function Location(query, location) {
    this.search_query = query;
    this.formatted_query = location.formatted_address;
    this.latitude = location.geometry.location.lat;
    this.longitude = location.geometry.location.lng;
  }
server.use('*', (request, response) =>{
  response.status(404).send('Not Found');
});

function handleError(err, response) {
    if (response) response.status(500).send('error');
  }

server.listen( PORT, () => console.log(`App listening on ${PORT}`));