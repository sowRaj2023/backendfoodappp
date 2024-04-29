const express = require("express");
const path = require("path");
const {open}  = require("sqlite");
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt");
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, "user.db");

let db;

// initialize database

const initializeDbAndServer =  async() => {
    try {
        db= await open({

            filename:dbPath,
            driver:sqlite3.Database,
        });
        
    app.listen(3004, () => {
    console.log("server running at 3004");
});
          
    }catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};
initializeDbAndServer();


//get user API

app.get("/user/", async (request, response) =>{

    const getUserQuery = `
    select
    *
    from 
    userDb
    order by
    username;`;
    const getUserArray = await db.all(getUserQuery);
    response.send(getUserArray);

});

//Register API

app.post("/register", async (request,response) =>{
  const{username,name,password,gender,location} = request.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const selectUserQuery = `
  select
  *
  from
  userDb
  where
  username = '${username}';`;
  const dbData = await db.get(selectUserQuery);

  if(dbData===undefined){
    //create new user
    const createNewUser = 
    `
    insert into
    userDb (username,name,password,gender,location)
    values(
    '${username}',
    '${name}',
    '${hashedPassword}',
    '${gender}',
    '${location}')`;
    await db.run(createNewUser);
    response.send("created successfully");
  }else{
    //user already exist
    response.status(400).send("user already exist");
  }
});