const connection = require('../libs/conexionBD');


function connect(){
    connection.connect(function(error){
        if(error){
            console.log('ERROR: '+ error );
        }
        else{
            console.log('conexion exitosa');
        }
    })  
}
function disconnect(){
    connection.end(function(error){
        if(error){
            console.log('Error: '+ error)
        }else{
            console.log("coneccion cerrada correctamente")
        }
        
    });
}
function getCompetencias(rq,res){
    connection.query('select * from competencias', function(error, result){
        if(error){
            console.log('Error: '+ error);
            res.status(403).send('ERROR EN LA CONSULTA');
        }
        else{
            res.status(201).send(result)
        }
    });
}
function getOpciones(rq,res){
    let peliculas = [];
    connection.query('select * from pelicula order by rand() limit 2', function(error, result){
        if(error){
            console.log('Error: '+ error);
            res.status(403).send('ERROR EN LA CONSULTA');
        }
        else{
            if(result.length==0){
                res.status(200).send("no se encontraron peliculas")
                return; 
            }
            
            for(let i = 0 ; i<result.length ; i++){
                let pelicula = result[i];
                peliculas.push(pelicula);                
            }            
            res.status(201).send(
                data={
                    'competencia': res.locals.competencia,
                    'peliculas': peliculas})
        }
    }); 
}


function setVoto(rq,res){
    console.log("voto")
    console.log(`INSERT INTO competencias_pelicula (competencia_id,pelicula_id) 
    VALUES (${rq.params.idCompetencia},${rq.body.idPelicula})`)
    let sqlQuery = `INSERT INTO competencias_pelicula (competencia_id,pelicula_id) 
                        VALUES (${rq.params.idCompetencia},${rq.body.idPelicula})`;
    connection.query(sqlQuery, function(error, result){
        if(error){
            console.log('Error: '+ error);
            res.status(404).send('La competencia no existe');
        }
        else{
            res.status(201).send(result)
        }
    });
}

function validarCompetencia(rq,res,next){
    console.log("competencia")
    connection.query(`select * from competencias WHERE id= ${rq.params.idCompetencia}`, function(error, result){
        
        if(error || result.length == 0){
            console.log('Error: '+ error);
            res.status(404).send('La competencia no existe');
        }
        next();
    }
    );
}
function validarPelicula(rq,res,next){
    console.log(rq.url)
    console.log(rq.query)
    console.log("pelicula")
    console.log(rq.body)
    console.log(`select * from pelicula WHERE id= ${rq.body.idPelicula}`)
    connection.query(`select * from pelicula WHERE id= ${rq.body.idPelicula}`, function(error, result){
        
        if(error || result.length === 0){
            console.log('Error: '+ error);
            res.status(404).send('La pelicula no existe');
        }
        next();
    }
    );
}

module.exports={
    getOpciones: getOpciones,
    getCompetencias: getCompetencias,
    validarCompetencia: validarCompetencia,
    validarPelicula: validarPelicula,
    setVoto:setVoto
}