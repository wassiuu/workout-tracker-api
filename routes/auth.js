const express = require("express");
const db = require("../db/database");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/signup",async (req,res) => {

  const { name, email, password } = req.body;

  if( 
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string"
  ){
    return res.status(400).json({
      "message" : "name, email and password are required"
    });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72){
    return res.status(400).json({
      "message" : "password must be atleast 8 characters long and not exceed 72 bytes"
    })
  }

  try{
    const password_hash = await bcrypt.hash(password,12);


    db.run(`INSERT INTO users (name,email,password_hash)
            VALUES(?,?,?)`,
            [name.trim(),email.trim().toLowerCase(),password_hash],
            function(err){
              if (err){
                if (err.code === "SQLITE_CONSTRAINT"){
                  return res.status(409).json({
                    "error" : "User Already Exsits"
                  })
                }

                console.error(err)
                return res.status(500).json({
                  "error":"Failed to create an account"
                })
              }

              return res.status(201).json({
                "message":"User Successfully Created",
                "user_id": this.lastID
              })
            }
          )
  } catch(err) {
    console.error(err)
    return res.status(500).json({
      "error" : "Failed to create an account"
    })
  }
})

module.exports = router;
