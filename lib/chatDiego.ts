import {
    Duration,
    Stack, StackProps,
  } from 'aws-cdk-lib'
  import { Construct } from 'constructs'
  
  
  import {
    FunctionConstruct,
    RestApiConstruct,
    TinyVectorDBConstruct
  } from 'devarchy-cdk'
  
  export class ChatBotStack extends Stack {
  
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id)
  
  
      const vectorDB = new TinyVectorDBConstruct(this, 'vectorDB')
  
  
      // [ ] index a folder and create the database files
      // vectorDB.indexFolder('./path/to/docs')
  
      // [ ] create a way to add data, either local or from s3
      // vectorDB.indexFolder('./docs', 'web-knowledge')
      // vectorDB.addDocs('./knowledge', 'db')
      // vectorDB.addDocs('./knowledge/db', 'db')
      // vectorDB.addDocs('./knowledge/docs', 'docs')
  
  
      // vectorDB.indexFolder('tech-docs')
  
  
      const ragHandler = new FunctionConstruct(this, 'handler')
  
      // const bucketName = vectorDB.bucket.bucketName
      // const bucketName = 'easyarcherybot-vectordbknowledgebasebucket3cd60e58-q6bg3cr7hisn'
      // const dataLayer = ragHandler.createLayer('data-layer', s3://${bucketName}/db)
  
      ragHandler.useLayer(vectorDB.layerName)
  
      ragHandler.createLayer('web-knowledge', './knowledge/db')
      // ragHandler.createLayer('web-knowledge', './knowledge/docs/web')
      // ragHandler.createLayer('archery-knowledge', './knowledge/docs/archery')
  
  
      ragHandler.code((async function handler(event) {
  
        const fs = require('fs/promises')
  
        const {
          search,
          askClaude,
        } = require('/opt/nodejs/lib/tiny-vector')
  
        const { dbName, query, ask } = event
        const res = await search(/opt/${dbName}, 'samples', query)
  
        const chunks = res.map(res => {
          const noVectorRes = { ...res }
          delete noVectorRes.vector
          return noVectorRes
        })
  
        if (!ask) {
          return {
            event,
            chunks,
          }
        }
        const answer = await askClaude(`Based on the following chunks of documents
        <chunks>
          ${chunks.map(chunk => chunk.item).join('\n\n')}
        </chunks>
  
        please answer the following question:
  
        <request>
          ${query}
        </question>
        `)
  
        return {
          event,
          chunks,
          answer,
        }
  
      }).toString())
  
      ragHandler.handlerFn.addToRolePolicy(vectorDB.titanPolicyStatement)
  
  
      const chatBotApi = new RestApiConstruct(this, 'chatbotApi')
  
      chatBotApi.cors()
  
      const handleQuery = new FunctionConstruct(this, 'handleQuery')
  
  
  
      handleQuery.useLayer(vectorDB.layerName)
  
      handleQuery.useLayer('web-knowledge')
      // handleQuery.useLayer('archery-knowledge')
  
      handleQuery.code((async function handler(event) {
        const fs = require('fs/promises')
        const {
          search,
          askClaude,
        } = require('/opt/nodejs/lib/tiny-vector')
        console.log('event', event)
        const isRest = event.body && typeof event.body === 'string'
        const body = isRest ? JSON.parse(event.body) : event
  
        // query is to look on the vector db
        // question is the question on that topic
        const { dbName, query, question } = body
  
        let chunks
  
        if (query) {
          const res = await search(/opt/${dbName || 'importdb'}, 'samples', query)
          chunks = res.map(res => {
            const noVectorRes = { ...res }
            delete noVectorRes.vector
            return noVectorRes
          })
        }
  
        let response
        if (!question || question === '') {
          response = {
            chunks,
          }
  
        } else if (!chunks) {
          const answer = await askClaude(question)
  
          response = { answer }
        } else {
  
          const answer = await askClaude(`Based on the following chunks of documents
          <chunks>
            ${chunks.map((chunk, index) => `<chunk index="${index}" ref="${chunk.path}">
              ${chunk.item}
            </chunk>`).join('\n')}
          </chunks>
          
          please answer the following request:
          
          <request>
          ${question}
          </request>
          `)
  
          response = {
            chunks,
            answer,
          }
        }
  
        // [ ] save the whole conversation on S3 so I can look back to see what people is asking
  
        if (!isRest) {
          return response
        }
  
        return {
          statusCode: 200,
          body: JSON.stringify(response),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
          },
        }
      }).toString(), {
        // @ts-ignore
        timeout: Duration.minutes(1)
      })
  
      handleQuery.handlerFn.addToRolePolicy(vectorDB.titanPolicyStatement)
  
      chatBotApi.post('/query')?.fn(handleQuery.handlerFn)
  
      // chatBotApi.post('/ask')
  
  
  
      // [ ] vectorDB export a layer that can be easily imported from other lambdas
      // handler.useLayer(vectorDB.layer)
  
    }
  
  
  
    createWhatsaapIntegration(name) {
      const api = new RestApiConstruct(this, name)
  
      const whatsappHandler = new FunctionConstruct(this, 'WhatsappWebhookHandler')
  
  
  
    }
  
  }