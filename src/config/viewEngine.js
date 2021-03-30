const express = require('express');
/*
    Configuração do motor de renderização do visual - Views Engine
*/

const viewEngine = (app) => {
    app.use(express.static("./src/public"));
    app.set("view Engine", "ejs");
    app.set("views", "./src/views");
};

module.exports = viewEngine;