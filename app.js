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
        let webhookEvent = entry.messaging[0];
        console.log(webhookEvent);
        
        // Obtenha o PSID do remetente
        let senderPsid = webhookEvent.sender.id;
        console.log('Sender PSID: ' + senderPsid);

        // Verifique se o evento é uma mensagem ou postback e
         // passe o evento para a função de tratamento apropriada
        if (webhookEvent.message) {
          handleMessage(senderPsid, webhookEvent.message);
        } else if (webhookEvent.postback) {
          handlePostback(senderPsid, webhookEvent.postback);
        }
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
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN; //"wiki24HP19972312"  
      
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

// Lida com eventos de mensagens
function handleMessage(senderPsid, receivedMessage) {
  let response;

  // Verifica se a mensagem contém texto
  if (receivedMessage.text) {
    // Crie a carga útil para uma mensagem de texto básica, que
     // será adicionado ao corpo da sua solicitação para a API de envio
    response = {
      'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
    };
  } else if (receivedMessage.attachments) {

    // Obtenha o URL do anexo da mensagem
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [{
            'title': 'Is this the right picture?',
            'subtitle': 'Tap a button to answer.',
            'image_url': attachmentUrl,
            'buttons': [
              {
                'type': 'postback',
                'title': 'Yes!',
                'payload': 'yes',
              },
              {
                'type': 'postback',
                'title': 'No!',
                'payload': 'no',
              }
            ],
          }]
        }
      }
    };
  }

  // Envie a mensagem de resposta
  callSendAPI(senderPsid, response);
}

// Lida com eventos messaging_postbacks
function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Obtenha a carga útil para o postback
  let payload = receivedPostback.payload;

  // Defina a resposta com base na carga útil de postback
  if (payload === 'yes') {
    response = { 'text': 'Thanks!' };
  } else if (payload === 'no') {
    response = { 'text': 'Oops, try sending another image.' };
  }
  // Envie a mensagem para reconhecer o postback
  callSendAPI(senderPsid, response);
}

// Envia mensagens de resposta por meio da API Send
function callSendAPI(senderPsid, response) {

  // O token de acesso à página que geramos nas configurações do seu aplicativo
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construir o corpo da mensagem
  let requestBody = {
    'recipient': {
      'id': senderPsid
    },
    'message': response
  };

  // Envie a solicitação HTTP para a plataforma do Messenger
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  }, (err, _res, _body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:' + err);
    }
  });
}

let listener = app.listen(process.env.PORT || 1997, function() {
  console.log('Webhook Funcionando... Porta:' + listener.address().port);
});

//app.listen(process.env.PORT || 1997, () => console.log("Webhook Funcionando..."));