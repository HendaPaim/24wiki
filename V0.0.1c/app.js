'use strict';

// Use dotenv para ler .env vars no Node
require('dotenv').config();

// # Importando as dependencias!
const
    request = require('request'),
    express = require('express'),
    { urlencoded, json } = require('body-parser'),
    app = express(); // Creando Servidor HTTP com  express
  
// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Criar Rota principal
app.get('/', (_req, res) => {
    res.send("PAGINA INICIAL");
})

// Cria o endpoint para webhook
app.post('/webhook', (req, res) => {  
 
    let body = req.body;
    
    // Verifica se este é um evento de uma assinatura de página
    if (body.object === 'page') {
    
        // Itera em cada entrada - pode haver vários se em lote
        body.entry.forEach(function(entry) {
    
        // Recebe a mensagem. entry.messaging é um array, mas // sempre conterá apenas uma mensagem, então obtemos o índice 0
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);
        });
    
        // Retorna uma resposta '200 OK' para todos os pedidos 
        res.status(200).send('EVENT_RECEIVED');
    } else {
        //Retorna um '404 Not Found' se o evento não for de uma assinatura de página
        res.sendStatus(404);
    }
});

// Adiciona suporte para solicitações GET ao nosso webhook
app.get('/webhook', (req, res) => {

    // Seu token de verificação. Deve ser uma string aleatória.
    let VERIFY_TOKEN = "wiki24HP19972312"
      
    // Analisa os parâmetros de consulta
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Verifica se um token e modo estão na string de consulta da solicitação
    if (mode && token) {
    
      // Verifica se o modo e o token enviado estão corretos
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responde com o token de desafio da solicitação
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responde com '403 Proibido' se os tokens de verificação não corresponderem
        res.sendStatus(403);      
      }
    }
});

app.listen(process.env.PORT || 1997, () => console.log("Webhook Funcionando"));