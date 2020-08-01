const http = require("http");
const url = require("url");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 4000;

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    return handleGetReq(req, res);
  } else if (req.method === "POST") {
    return handlePostReq(req, res);
  }
});

/* *************************************************        function to handle get request             ******************************************************************************* */

function handleGetReq(req, res) {
  const { pathname } = url.parse(req.url);
  const { query } = require("url").parse(req.url, true);

  if (pathname == "/") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    return res.end(
      `Hello World, Welcome to my notes apps,
      to fetch all topics/categories use the get route: localhost:4000/topics
    to create a new note category/topic use the post route: http://localhost:4000/topic/add?name='your topic here'
    to fetch all notes in a topic/category use the get route: localhost:4000/topic?notes='your topic/category here here'
    to create a new note in a category/topic use the route: localhost:4000/note/add, and add the following parameters from postman; category,data(content of the note),filename(filename the note will be saved with)
    to read a note use the route: localhost:4000/gettodo?name=finance&file=get.txt where finance is the name of the topic or category and get is the name of the file
    `
    );
  }

  if (pathname == "/topics") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readdir("./categories", (err, files) => {
      if (err || files.length <= 0) {
        return res.end(JSON.stringify("no categories found, add some!"));
      }
      const topics = [];
      files.forEach((file) => {
        console.log(file);
        topics.push(file);
      });
      res.end(JSON.stringify(topics));
    });
  }

  if (pathname == "/topic") {
    console.log(query.topic);
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readdir(`./categories/${query.topic}`, (err, files) => {
      if (err || files == undefined) {
        //here
        return res.end(JSON.stringify("no notes in this category, add some!"));
      }
      const topics = [];
      files.forEach((file) => {
        console.log(file);
        topics.push(file);
      });
      res.end(JSON.stringify(topics));
    });
  }

  if (pathname == "/gettodo") {
    console.log(query.name);
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readFile(
      `./categories/${query.name}/${query.file}`,
      "utf8",
      (err, data) => {
        if (err || data == undefined) {
          res.end(
            JSON.stringify(
              "Error: file not found, make sure you have the correct filename and category"
            )
          );
        }
        console.log(data);
        res.end(JSON.stringify(data));
      }
    );
  }

  //   if (pathname == "/topics/add") {
  //     res.setHeader("Content-Type", "application/json;charset=utf-8");
  //     return res.end(JSON.stringify(`topics ${query.name}`));
  //   }
}

/* *************************************************        function to handle post request request             ******************************************************************************* */
function handlePostReq(req, res) {
  const { pathname } = url.parse(req.url);
  const { query } = require("url").parse(req.url, true);
  const { parse } = require("querystring");

  if (pathname == "/topic/add") {
    fs.mkdir(
      process.cwd() + `/categories/${query.name}`,
      { recursive: true },
      function (err) {
        if (err) {
          console.log("failed to create directory", err);
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          return res.end(JSON.stringify(`topics ${query.name} ${err}`));
        } else {
          console.log("directory created succesfully");
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          return res.end(
            JSON.stringify(`topics ${query.name} succesfully created`)
          );
        }
      }
    );
    // return res.end(JSON.stringify(`topics ${query.name}`));
  }

  if (pathname == "/note/add") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log(parse(body));
      try {
        //   const requestData = JSON.parse(body);
        //   res.setHeader("Content-Type", "application/json");
        //   res.end(JSON.stringify(requestData));
        const todo = parse(body);
        fs.writeFile(
          //   process.cwd() + "/categories/finance/get.txt",
          process.cwd() +
            "/categories/" +
            todo.category +
            "/" +
            todo.filename +
            ".txt",
          todo.data,
          { recursive: true },
          (err) => {
            if (err) {
              res.end(
                "ERROR, the category youre trying to write a note to probably doesnt exist yet, create it and try again! "
              );
            }
            res.end("note added");
          }
        );
        // res.end(disp);
      } catch (e) {
        res.statusCode = 400;
        res.end("Invalid JSON");
      }
    });
  }
}

// post endpoints

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
