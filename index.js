require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./conf');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/api/movies', (req, res) => {

  const queryArr = Object.keys(req.query);

  if(!queryArr.length) {

    connection.query('SELECT * FROM movies', (err, results) => {
      if (err) {
        res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
      } else {
        res.json(results);
      }
      })
      } else {
        if(req.query.contains){
    
          const contains = `%${req.query.contains}%`;
            
          connection.query('SELECT * FROM movies WHERE name LIKE ?', contains, (err, results) => {
            if (err) {
              res.status(500).json({
              error: err.message,
              sql: err.sql,
            });
            } else {
              res.json(results);
            }
            });
        } else if (req.query.greaterThan) {

            const greaterThan = req.query.greaterThan;

            connection.query('SELECT * FROM movies WHERE date > ?', [greaterThan], (err, results) => {
                if (err) {
                  res.status(500).json({
                  error: err.message,
                  sql: err.sql,
                });
                } else {
                  res.json(results);
                }
            })
        } else {
            
            const startsWith = `${req.query.startsWith}%`;
            
            connection.query('SELECT * FROM movies WHERE name LIKE ?', [startsWith], (err, results) => {
                if (err) {
                  res.status(500).json({
                  error: err.message,
                  sql: err.sql,
                });
                } else {
                  res.json(results);
                }
            })
            
        }
    }
});

app.get('/api/movies/names', (req, res) => {

    connection.query('SELECT name FROM movies', (err, results) => {
        if (err) {
            res.status(500).json({
              error: err.message,
              sql: err.sql,
            });
          } else {
            res.json(results);
          }
    })
});

app.get('/api/movies/:order', (req, res) => {

    const orderBy = req.params.order;

    connection.query(`SELECT * FROM movies ORDER BY ${orderBy}`, (err, results) => {
        if (err) {
            res.status(500).json({
              error: err.message,
              sql: err.sql,
            });
          } else {
            res.json(results);
          }
    } )
});

app.post('/api/movies', (req, res) => {

    const formData= req.body;

    return connection.query('INSERT INTO movies SET ?', [formData], (err,results) => {
        if(err) {
        return res.status(500).json({
                 error: err.message,
                 sql: err.sql,
                });
        } 
        return connection.query('SELECT * FROM movies WHERE id = ?', results.insertId, (err2, records) => {
            if (err2) {
              return res.status(500).json({
                error: err2.message,
                sql: err2.sql,
              });
            }
            const insertedMovie = records[0];
            return res
              .status(201)
              .json(insertedMovie);
          });
    })
});

app.put('/api/movies/:id', (req,res) => {

    const formData = req.body;

    const id = req.params.id;

    return connection.query('UPDATE movies SET ? WHERE id = ?',[formData, id], (err, results) => {
        if(err) {
            return res.status(500).json({
                     error: err.message,
                     sql: err.sql,
                    });
        }
        return connection.query('SELECT * FROM movies WHERE id = ?', [id], (err2, records) => {
            if (err2) {
                return res.status(500).json({
                  error: err2.message,
                  sql: err2.sql,
                });
              }
              const updatedMovie = records[0];
              return res
              .status(201)
              .json(updatedMovie);
        })
    })
});

app.put('/api/movies/toggle_bool/:id', (req, res) => {

  const id = req.params.id
  connection.query('SELECT won_oscar FROM movies WHERE id = ?', [id], (err, results) => {
    if(err) {
      return res.status(500).json({
               error: err.message,
               sql: err.sql,
              });
  }
  if(results[0].won_oscar == 0){
    connection.query('UPDATE movies SET won_oscar = 1 WHERE id = ?', [id], (err2, records) => {
      if(err) {
        return res.status(500).json({
                 error: err.message,
                 sql: err.sql,
                });
    }
    return res
      .status(201)
      .json({msg:'boolean successfully changed to true'})
    })
  } else {
    connection.query('UPDATE movies SET won_oscar = 0 WHERE id = ?', [id], (err2, records) => {
      if(err) {
        return res.status(500).json({
                 error: err.message,
                 sql: err.sql,
                });
    }
    return res
      .status(201)
      .json({msg:'boolean successfully changed to false'})
    })
  }
  })
})

app.delete('/api/movies/:id', (req, res) => {

    const id = req.params.id;

    connection.query('DELETE FROM movies WHERE id = ?', [id], (err, results) => {
        if(err) {
            return res.status(500).json({
                     error: err.message,
                     sql: err.sql,
                    });
        }
        if(results.affectedRows === 0){
          return res
          .status(404)
          .json({msg: 'user does not exist'})
        }
        return res
        .status(201)
        .json(results)
    })
});

app.delete('/api/movies', (req, res) => {

  connection.query('DELETE FROM movies WHERE won_oscar = 0', (err, results) => {
    if(err) {
      return res.status(500).json({
               error: err.message,
               sql: err.sql,
              });
  }
  return res
        .status(201)
        .json({msg: 'deleted all movies who did not win an oscar'})
  })
})


app.listen(process.env.PORT, (err) => {
    if (err) {
      throw new Error('Something bad happened...');
    }
  
    console.log(`Server is listening on ${process.env.PORT}`);
  });
  
    