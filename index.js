const express = require('express');
const bodyParser = require('body-parser');
const Dotenv = require("dotenv-webpack");


const app = express();

app.use(bodyParser.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get("/status", (request, response) => {
    const status = {
        "Status": "Running"
    };

    response.send(status);
});

