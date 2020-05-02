const connection = require("../libs/conexionBD");

function getCompetencias(rq, res) {
  connection.query("select * from competencias", function(error, result) {
    if (error) {
      console.log("Error: " + error);
      res.status(500).send("ERROR EN LA CONSULTA");
    } else {
      res.status(200).send(result);
    }
  });
}
function getOpciones(rq, res) {
  let peliculas = [];
  connection.query(`select * from competencias where id = ${rq.params.idCompetencia}`, function (error, result){
    if (error) {
      console.log("Error: " + error);
      res.status(500).send("ERROR EN LA CONSULTA: getOpciones");
    } 
    else {   
      let query = makeQueryForGetOpciones(result[0].director_id,result[0].genero_id,result[0].actor_id)
      connection.query(query,
      function(error,result) {
        if (error) {
          console.log("Error: " + error);
          res.status(500).send("ERROR EN LA CONSULTA:getOpciones");
        } 
        else {
          if (result.length == 0) {
            res.status(402).send("no se encontraron peliculas");
            return;
          }
          for (let i = 0; i < result.length; i++) {
            let pelicula = result[i];
            peliculas.push(pelicula);
          }
          res.status(200).send(
            (data = {
              competencia: res.locals.competencia,
              peliculas: peliculas
            })
          );
        }
      });
    }
  })
}

function setVoto(rq, res) {
  let sqlQuery = `INSERT INTO competencias_pelicula (competencia_id,pelicula_id) 
                        VALUES (${rq.params.idCompetencia},${rq.body.idPelicula})`;
  connection.query(sqlQuery, function(error, result) {
    if (error) {
      console.log("Error: " + error);
      res.status(422).send("La competencia no existe");
    } else {
      res.status(200).send(result);
    }
  });
}

function validarCompetencia(rq, res, next) {
  connection.query(
    `select * from competencias WHERE id= ${rq.params.idCompetencia}`,
    function(error, result) {
      if (error || result.length == 0) {
        console.log("Error: " + error);
        res.status(422).send("La competencia no existe");
      }
      res.locals.competencia = result[0].nombre;
      next();
    }
  );
}
function validarPelicula(rq, res, next) {
  connection.query(
    `select * from pelicula WHERE id= ${rq.body.idPelicula}`,
    function(error, result) {
      if (error || result.length === 0) {
        console.log("Error: " + error);
        res.status(500).send("La pelicula no existe");
      }
      next();
    }
  );
}

function getResultados(rq, res, next) {
  let query = `SELECT c.nombre, p.poster, p.titulo, count(*) as cant_votos
  FROM competencias_pelicula ac
  left JOIN pelicula p
    ON p.id = ac.pelicula_id
  left JOIN competencias c
    ON c.id = ac.competencia_id
  WHERE ac.competencia_id = ${rq.params.idCompetencia}
  GROUP BY p.titulo
  ORDER BY cant_votos DESC
  LIMIT 3`
  connection.query(query, function(error, result) {
    if (error ) {
      console.log("Error: " + error);
      res.status(403).send("Error en la consulta en BD");
    } else {
      
      if(result.length === 0 ){
        res.status(200).send({resultados: [],competencia:"La competencia no tiene votos"})
        return;
      }
        
      let peliculas = [];
      for (const row of result) {
        let pelicula = {
          idPelicula: row.idPelicula,
          poster: row.poster,
          titulo: row.titulo,
          votos: row.cant_votos
        };
        peliculas.push(pelicula);
      }
      let data = {
        resultados: peliculas,
        competencia: result[0].nombre
      };
      res.status(201).send(data);
    }
  });
}

function crearCompetencia(rq, res) {
  
  if(res.locals.competenciaValida){
    let query = makeQueryForCrearCompetencia( rq.body.nombre,rq.body.genero,rq.body.actor,rq.body.director )
    connection.query(query,function(error, result) {
        if (error) {
          console.log("Error en competenciaValida: " + error);
          res.status(500).send("Error en la consulta");
        } else {
          res.status(201).send('competencia creada');
        }
      }
      );
  }
}

function borrarCompetencia(rq, res) {
  connection.query(
    `delete from competencias_pelicula where competencia_id = ${rq.params.idCompetencia}`,
    function(error, result) {
      if (error) {
        console.log("Error: " + error);
        res.status(401).send("ERROR EN LA CONSULTA: reiniciarCompetencia");
        return;
      }
    }
  );
  connection.query(
    `delete from competencias where id=${rq.params.idCompetencia}`,
    function(error, result) {
      if (error) {
        console.log("Error: " + error);
        res.status(401).send("ERROR EN LA CONSULTA: borrarCompetencia");
        return;
      }
      else{
        res.status(201).send();
      }
    }
  );
}

function reiniciarCompetencia(rq, res) {
  connection.query(
    `delete from competencias_pelicula where competencia_id = ${rq.params.idCompetencia}`,
    function(error, result) {
      if (error) {
        console.log("Error: " + error);
        res.status(401).send("ERROR EN LA CONSULTA: reiniciarCompetencia");
        return;
      }
      else {
        res.status(201).send("competencia borrada")
      }
    }
  );
}

function getGeneros(rq, res) {
  let generos = [];
  connection.query("select * from genero", function(error, result) {
    if (error) {
      console.log("Error: " + error);
      res.status(403).send("ERROR EN LA CONSULTA getGeneros");
    } else {
      if (result.length == 0) {
        res.status(200).send("no se encontraron generos");
        return;
      }

      for (let i = 0; i < result.length; i++) {
        let genero = {
          id: result[i].id,
          nombre: result[i].nombre
        };
        generos.push(genero);
      }
      res.status(201).send(generos);
    }
  });
}

function getDirectores(rq, res) {
  let directores = [];
  connection.query("select * from director", function(error, result) {
    if (error) {
      console.log("Error: " + error);
      res.status(403).send("ERROR EN LA CONSULTA getDirectores");
    } else {
      if (result.length == 0) {
        res.status(200).send("no se encontraron directores");
        return;
      }

      for (let i = 0; i < result.length; i++) {
        let director = {
          id: result[i].id,
          nombre: result[i].nombre
        };
        directores.push(director);
      }
      res.status(201).send(directores);
    }
  });
}

function getActores(rq, res) {
  let actores = [];
  connection.query("select * from actor", function(error, result) {
    if (error) {
      console.log("Error: " + error);
      res.status(403).send("ERROR EN LA CONSULTA getActores");
    } else {
      if (result.length == 0) {
        res.status(200).send("no se encontraron Actores");
        return;
      }

      for (let i = 0; i < result.length; i++) {
        let actor = {
          id: result[i].id,
          nombre: result[i].nombre
        };
        actores.push(actor);
      }
      res.status(201).send(actores);
    }
  });
}

function competenciaValida(req,res,next){
  let query = makeQueryForCompetenciaValida(req.body.director, req.body.genero, req.body.actor)
  
  connection.query(query,
    function(error, result) {
      if (error) {
        console.log("Error en competenciaValida: " + error);
        res.locals.competenciaValida =  false;
      }else{
        if(result.length >= 1){
          res.locals.competenciaValida =  true;
        }
        else {
          res.status(422).send('No existen 2 peliculas con esos parametros' );

        }
      }
      next();
    }
  );
    
}

function makeQueryForCompetenciaValida(director, genero, actor){
  query =`SELECT p.director, p.genero_string, a.nombre 
  FROM director d 
    JOIN pelicula p
      ON p.director = d.nombre
    JOIN genero g
      ON p.genero_id = g.id
    JOIN actor_pelicula ap 
      ON ap.pelicula_id = p.id
    JOIN actor a 
      ON a.id = ap.actor_id
  WHERE TRUE `
  if (parseInt(director) ) {
    query += `AND d.id = ${director} `
  }
  if (parseInt(genero)) {
    query += `AND g.id = ${genero} `
  }
  if (parseInt(actor)) {
    query += `AND a.id = ${actor} `
  }
  return query
}

function makeQueryForGetOpciones(director, genero, actor){
  query =`SELECT p.id, p.poster, p.titulo 
  FROM director d 
    JOIN pelicula p
      ON p.director = d.nombre
    JOIN genero g
      ON p.genero_id = g.id
    JOIN actor_pelicula ap 
      ON ap.pelicula_id = p.id
    JOIN actor a 
      ON a.id = ap.actor_id
  WHERE TRUE `
  if (director) {
    query += `AND d.id = ${director} `
  }
  if (genero ) {
    query += `AND g.id = ${genero} `
  }
  if (actor) {
    query += `AND a.id = ${actor} `
  }
  query += `GROUP BY p.id ORDER BY RAND()`
  return query
}

function makeQueryForCrearCompetencia(nombre, genero, actor,director){
  let query = ''
  let queryPart1 =`INSERT INTO competencias (nombre`
  let queryPart2 =` VALUES ('${nombre}'`
  if(parseInt(genero)){
    queryPart1 +=`, genero_id` 
    queryPart2 += `, ${genero}`    
  }else if (parseInt(actor)){
    queryPart1 +=`, actor_id` 
    queryPart2 += `, ${actor}` 
  }else if (parseInt(director)){
    queryPart1 +=`, director_id` 
    queryPart2 += `, ${director}` 
  }
  query = queryPart1+ ")" + queryPart2 + ")"
    return query
}

function editarCompetencia(req,res){
  let query = `UPDATE competencias set nombre = '${req.body.nombre}'
    where id =${req.params.idCompetencia};`
  connection.query(query,
    function(error, result) {
      if (error) {
        console.log("Error en editarCompetencia: " + error);
      }
      else {
        res.status(201).send("competencia modificada");

      }
    })  
}
function getCompetencia(req,res){
  let query = `SELECT c.nombre, a.nombre as a_nombre, d.nombre as d_nombre, g.nombre as g_nombre 
  FROM competencias c
  LEFT JOIN actor a
    ON a.id = c.actor_id
  LEFT JOIN director d 
    ON d.id = c.director_id
  LEFT JOIN genero g
    ON g.id = c.genero_id 
  WHERE c.id = ${req.params.idCompetencia}`
connection.query(query,
  function(error, result) {
    if (error) {
      console.log("Error en editarCompetencia: " + error);
    }
    else {
      data = {
        nombre: result[0].nombre,
        genero_nombre: result[0].g_nombre,
        actor_nombre: result[0].a_nombre,
        director_nombre: result[0].d_nombre,
      }
      res.status(201).send(data);
      
    }
  })  
}

module.exports = {
  getOpciones: getOpciones,
  getCompetencias: getCompetencias,
  validarCompetencia: validarCompetencia,
  validarPelicula: validarPelicula,
  setVoto: setVoto,
  getResultados: getResultados,
  crearCompetencia: crearCompetencia,
  borrarCompetencia: borrarCompetencia,
  reiniciarCompetencia: reiniciarCompetencia,
  getGeneros: getGeneros,
  getDirectores: getDirectores,
  getActores: getActores,
  competenciaValida: competenciaValida,
  editarCompetencia: editarCompetencia,
  getCompetencia: getCompetencia,
};
