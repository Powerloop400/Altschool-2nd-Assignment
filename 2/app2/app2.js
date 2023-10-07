const fs = require('fs')
const path = require('path')
const http = require('http')
const url = require('url'); 

const itemsDbPath = path.join(__dirname,'db', 'items.json')
const PORT = 3000

function requestHandler(req, res) {

const parsedUrl = url.parse(req.url, true);
const pathName = parsedUrl.pathname;

    if (req.url === '/items' && req.method === 'GET') {
        getAllitems(req, res)
    } else if (req.url === '/items' && req.method === 'POST') {
        addItem(req, res)
    } else if (req.url === '/items' && req.method === 'PUT'){
        updateItem(req, res)
    } else if (req.method === 'DELETE'){
        const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const pathMatch = pathName.match(/^\/items\/(.+)$/);
    if (pathMatch) {
      const id = pathMatch[1];
      deleteItem(id, res);
      return;
    }
    } if (req.method === 'GET' && pathName.match(/^\/items\/(.+)$/)){
        const pathName = parsedUrl.pathname;
    const pathMatch = pathName.match(/^\/items\/(.+)$/);
    if (pathMatch) {
      const id = pathMatch[1];
        getItemById(id, res)
    }
    }
}

const server = http.createServer(requestHandler)

function getAllitems(req, res) {
    fs.readFile(itemsDbPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('Internal Server Error')
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(data)
        }
    })
}

function addItem(req, res) {
    const body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    })


    req.on("end", () => {
    const parsedItem = Buffer.concat(body).toString()
    const newItem = JSON.parse(parsedItem)

    fs.readFile(itemsDbPath, "utf8", (err, data) => {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }
        const oldItem = JSON.parse(data)
        const allItems = [...oldItem, newItem]
        fs.writeFile(itemsDbPath, JSON.stringify(allItems, null, 2), (err) => {
            if (err){
                console.log(err)
                res.writeHead(400)
                res.end("An error occured")
            }
            res.writeHead(201)
            res.end("Item added")
        })
    })
}
    )}

function updateItem(req, res) {
    const body = []
    req.on("data", (chunk) => {
        body.push(chunk)
    })

    req.on("end", () => {
        const parsedItem = Buffer.concat(body).toString()
        const detailsToUpdate = JSON.parse(parsedItem)
        const itemId = detailsToUpdate.id

        fs.readFile(itemsDbPath, "utf8", (err, items) => {
            if (err) {
                console.log(err)
                res.writeHead(400)
                res.end("An error occured")
            }

            const itemsObj = JSON.parse(items)

            const itemIndex = itemsObj.findIndex(item => item.id === itemId)

            if (itemIndex === -1) {
                res.writeHead(404)
                res.end("Book with the specified id not found!")
                return
            }

            const updatedItem = {...itemsObj[itemIndex], ...detailsToUpdate}
            itemsObj[itemIndex] = updatedItem

            fs.writeFile(itemsDbPath, JSON.stringify(itemsObj, null, 2), (err) => {
                if (err) {
                    console.log(err)
                    res.writeHead(400)
                    res.end("An error occured")
                }
                res.writeHead(200)
                res.end("Item updated")
            })
    })
})
}

function deleteItem(id, res) {
    fs.readFile(itemsDbPath, "utf8", (err, items) => {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }

        const itemsObj = JSON.parse(items)

        const itemIndex = itemsObj.find(item => item.id === id)

        if (itemIndex === -1){
            res.writeHead(404)
            res.end("Item with the specified id not found!")
            return
        }

        itemsObj.splice(itemIndex, 1)

        fs.writeFile(itemsDbPath, JSON.stringify(itemsObj, null, 2), (err) => {
            if (err){
                console.log(err)
                res.writeHead(400)
                res.end("An error occured")
            }
            res.writeHead(200)
            res.end("Item deleted")
        })
    })
}

function getItemById(id, res){

    fs.readFile(itemsDbPath, "utf8", (err, items) => {
        if (err){
            console.log(err)
            res.writeHead(400)
            res.end("An error occured")
        }

        const itemsObj = JSON.parse(items)

        const item = itemsObj.find(item => item.id === (id))

        if (!item){
            res.writeHead(404)
            res.end("Item with the specified id not found!")
            return
        }

        res.writeHead(200, {"Content-Type": "application/json"})
        res.end(JSON.stringify(item))
    })
}

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

