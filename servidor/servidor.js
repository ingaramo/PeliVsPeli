let express = require('express');
let controlador = require('../servidor/controladores/controlador');
let bodyParser = require('body-parser');
var cors = require('cors');

const puerto = '8080';
let app = express();
app.use(cors());

app.use(bodyParser.json());

app.listen(puerto, function(){
    console.log('Escuchando puerto '+ puerto);
})

app.get('/competencias',controlador.getCompetencias);

app.post("/competencias/:idCompetencia/voto",controlador.validarCompetencia,
                                             controlador.validarPelicula,
                                             controlador.setVoto);

app.get("/competencias/:idCompetencia/peliculas",controlador.validarCompetencia,controlador.getOpciones);

