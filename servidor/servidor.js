let express = require('express');
let controlador = require('../servidor/controladores/controlador');
let bodyParser = require('body-parser');
var cors = require('cors');

const puerto = '8080';
let app = express();
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.listen(puerto, function(){
    console.log('Escuchando puerto '+ puerto);
})
app.get('/competencias',controlador.getCompetencias);
app.post("/competencias",controlador.competenciaValida, controlador.crearCompetencia);
app.get("/competencias/:idCompetencia",controlador.getCompetencia)
app.delete("/competencias/:idCompetencia",controlador.borrarCompetencia)
app.put("/competencias/:idCompetencia",controlador.editarCompetencia);
app.delete("/competencias/:idCompetencia/votos",controlador.reiniciarCompetencia)
app.post("/competencias/:idCompetencia/voto",controlador.validarCompetencia,
                                             controlador.validarPelicula,
                                             controlador.setVoto);
app.get("/competencias/:idCompetencia/peliculas",controlador.validarCompetencia,
                                                controlador.getOpciones);
app.get("/competencias/:idCompetencia/resultados",controlador.getResultados);
app.get("/generos",controlador.getGeneros);
app.get("/directores",controlador.getDirectores);
app.get("/actores",controlador.getActores);

