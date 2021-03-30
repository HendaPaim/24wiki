require("dotenv").config();
const express = require("express");
const bodyParser = require( "body-parser");

import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";

const app = express();
const port = process.env.PORT || 1997;

// Config view Engine
viewEngine(app);

// Usar body-Parser para post data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

// Config routes
initWebRoutes(app);

app.listen(port, () => {
    console.log(`Servidor funcionando na porta ${port}`);
});