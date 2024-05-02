const express = require("express");
const path = require("path");
const {open}  = require("sqlite");
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

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

app.get("/", (request,response) => {
  response.send("checking");
})

//get user details
app.get("/user", async (request, response) =>{

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

//login API
app.post("/login", async (request,response) => {
 try{
  const {password,username} = request.body;
  const selectUser = `
  select
  *
  from
  userDb
  where
  username = '${username}'`;
  const userData  = await db.get(selectUser)

  if(!userData){
    return response.status(400).send("Invalid Username or Password")
  }
  const passwordMatch = await bcrypt.compare(password, userData.password);

  if(passwordMatch){
    const jwt_token = await jwt.sign({username},"sowndharya" )
    return response.send({jwt_token})
  }else{
    return response.status(400).send("Invalid Username or Password");
  }

}catch(error){
  console.error("Login Error:", error)
  response.status(500).send("Internal Server Error")
}
});

//get menu items

app.get("/menu", async (request, response) =>{

  
 
   const getMenuQuery = `
   select
   *
   from 
   menuDb
   order by
   price ASC
   ;`;
   const getMenuArray = await db.all(getMenuQuery);
   response.send(getMenuArray);
 
 });


//get prime items

app.get("/prime", async (request, response) =>{

  const getPrimeQuery = `
  select
  *
  from 
  primeDb
  order by
  id;`;
  const getPrimeArray = await db.all(getPrimeQuery);
  response.send(getPrimeArray);

});




