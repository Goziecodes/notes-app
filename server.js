const http = require("http");
const url = require("url");
const fs = require("fs");
const readline = require("readline");
const { once } = require("process");

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

  // landing page
  if (pathname == "/") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    console.log(`Hello World, Welcome to my notes apps,
    to fetch all topics/categories use the get route: localhost:4000/topics
  to create a new note topic use the post route: http://localhost:4000/topic/add?name='your topic here'
  to fetch all notes in a topic/category use the get route: localhost:4000/topic?notes='your topic/category here here'
  to create a new note in a category/topic use the route: localhost:4000/note/add, and add the following parameters from postman; category,data(content of the note),filename(filename the note will be saved with)
  to read a note use the route: localhost:4000/getnote?name=finance&file=get.txt where finance is the name of the topic or category and get is the name of the file
  to edit a note use: localhost:4000/editnote
  to delete a note use: localhost:4000/deletenote
  to get all notes summary use: localhost:4000/notes/summary`);

    return res.end(
      `Hello World, Welcome to my notes apps,
    to fetch all topics/categories use the get route: localhost:4000/topics
  to create a new note topic use the post route: http://localhost:4000/topic/add?name='your topic here'
  to fetch all notes in a topic/category use the get route: localhost:4000/topic?notes='your topic/category here here'
  to create a new note in a category/topic use the route: localhost:4000/note/add, and add the following parameters from postman; category,data(content of the note),filename(filename the note will be saved with)
  to read a note use the route: localhost:4000/getnote?name=finance&file=get.txt where finance is the name of the topic or category and get is the name of the file
  to edit a note use: localhost:4000/editnote
  to delete a note use: localhost:4000/deletenote
  to get all notes summary use: localhost:4000/notes/summary`
    `
    );
  }

  // list all topics
  if (pathname == "/topics") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readdir("./topics", (err, files) => {
      if (err || files.length <= 0) {
        console.log("no categories found, add some!");
        return res.end(JSON.stringify("no categories found, add some!"));
      }
      const topics = [];
      files.forEach((file) => {
        topics.push(file);
      });
      console.table(topics);
      res.end(JSON.stringify(topics));
    });
  }

  // list all notes in a topic
  if (pathname == "/topic") {
    // console.log(query.topic);
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readdir(`./topics/${query.topic}`, (err, files) => {
      if (err || files == undefined) {
        console.log("no notes in this category, add some!");
        return res.end(JSON.stringify("no notes in this category, add some!"));
      }
      const notes = [];
      files.forEach((file) => {
        notes.push(file);
      });
      console.table(notes);
      res.end(JSON.stringify(notes));
    });
  }

  // read a particular note
  if (pathname == "/getnote") {
    // console.log(query.name);
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    fs.readFile(`./topics/${query.name}/${query.file}`, "utf8", (err, data) => {
      if (err || data == undefined) {
        console.log(
          "Error: file not found, make sure you have the correct filename and category"
        );
        res.end(
          JSON.stringify(
            "Error: file not found, make sure you have the correct filename and category"
          )
        );
      }
      console.log(data);
      res.end(JSON.stringify(data));
    });
  }

  // summary of all notes(prints he first line of each note)
  if (pathname == "/notes/summary") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    const categories = [];
    const notes = [];

    fs.readdir("./topics", (err, files) => {
      if (err || files.length <= 0) {
        console.log("no categories found, add some!");
        return res.end(JSON.stringify("no categories found, add some!"));
      }

      files.forEach((file) => {
        categories.push(file);
      });

      categories.map((category) => {
        fs.readdir(`./topics/${category}`, (err, files) => {
          if (err || files == undefined) {
            console.log("no notes in this category, add some!");
            return res.end(
              JSON.stringify("no notes in this category, add some!")
            );
          }

          files.forEach((file) => {
            const mySummary = readline.createInterface({
              input: fs.createReadStream(`./topics/${category}/${file}`),
            });

            mySummary.on("line", (line) => {
              console.log(`**${file} summary: ${line}...`);
              res.end(JSON.stringify(`**${file} summary: ${line}...`));
              mySummary.close();
            });
          });
        });
      });
    });
  }
}

/* *************************************************        function to handle post request request             ******************************************************************************* */
function handlePostReq(req, res) {
  const { pathname } = url.parse(req.url);
  const { query } = require("url").parse(req.url, true);
  const { parse } = require("querystring");

  // add a new topic
  if (pathname == "/topic/add") {
    fs.mkdir(
      process.cwd() + `/topics/${query.name}`,
      { recursive: true },
      function (err) {
        if (err) {
          console.log("failed to create directory", err);
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          return res.end(JSON.stringify(`topics ${query.name} ${err}`));
        } else {
          console.log(`topic ${query.name} succesfully created`);
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          return res.end(
            JSON.stringify(`topic ${query.name} succesfully created`)
          );
        }
      }
    );
  }

  // add new note
  if (pathname == "/note/add") {
    let body = "";
    req.on("data", (chunk) => {
      console.log("llllllllllllll");
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log(parse(body));
      try {
        const todo = parse(body);
        fs.writeFile(
          process.cwd() +
            "/topics/" +
            todo.category +
            "/" +
            todo.filename +
            ".txt",
          todo.data,
          { recursive: true },
          (err) => {
            if (err) {
              console.log(
                "ERROR, the category youre trying to write a note to probably doesnt exist yet, create it and try again! "
              );
              res.end(
                "ERROR, the category youre trying to write a note to probably doesnt exist yet, create it and try again! "
              );
            }
            console.log("note added");
            res.end("note added");
          }
        );
      } catch (e) {
        res.statusCode = 400;
        res.end("Invalid JSON");
      }
    });
  }

  // edit or add to note
  if (pathname == "/editnote") {
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    let body = "";
    let update = null;
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      update = parse(body);

      fs.appendFile(
        `./topics/${update.category}/${update.filename}`,
        ` \n ${update.data}`,
        (err) => {
          if (err) {
            console.log(
              "Error: file not found, make sure you have the correct filename and category"
            );
            res.end(
              JSON.stringify(
                "Error: file not found, make sure you have the correct filename and category"
              )
            );
          }
        }
      );
      fs.readFile(
        `./topics/${update.category}/${update.filename}`,
        "utf8",
        (err, data) => {
          if (err || data == undefined) {
            console.log(
              console.log(
                "Error: file not found, make sure you have the correct filename and category"
              )
            );
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
    });
  }

  // delete note
  if (pathname == "/deletenote") {
    let body = "";
    let category = null;

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      category = parse(body);

      fs.readdir(`./topics/${category.category}`, (err, files) => {
        if (err || files == undefined) {
          //here
          return res.end(
            JSON.stringify("no notes in this category, add some!")
          );
        }

        if (files.length <= 1) {
          fs.unlinkSync(`./topics/${category.category}/${category.filename}`);
          fs.rmdirSync(`./topics/${category.category}`);
          console.log(
            `${category.filename} and category ${category.category} deleted`
          );
        } else {
          fs.unlink(
            `./topics/${category.category}/${category.filename}`,
            (err) => {
              if (err) {
                console.log(err);
              }
              console.log(`${category.filename} deleted`);
            }
          );
        }
      });
    });
  }
}

// post endpoints

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
