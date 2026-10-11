const express = require("express");
const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

router.post("/login",async (req,res)=>{
  const { email,password } = req.body;

  if (typeof email !== "string" || !email.trim() || 
  typeof password !== "string" || !password){
    return res.status(401).json({
      error : "invalid email id or password"
    })
  }


  db.get(`SELECT id,password_hash
        FROM users
        WHERE email = ?`,
      [email.trim().toLowerCase()],

     async function(err,row){
        if(err){
          console.error(err)
          return res.status(500).json({
            error : "Database Error"
          })
        }

        if (!row){
          return res.status(404).json({
            error : "Invalid Email ID or Password"
          })
        }

        try {
          const passwordMatches = await bcrypt.compare(password,row.password_hash);

          if (!passwordMatches){
            return res.status(401).json({
              error : "Password Doesnt't Match"
            })
          }

         const token = jwt.sign(
          {user_id: row.id},
          process.env.JWT_SECRET,
          { expiresIn : "1h" }
         );

         return res.status(200).json({
          message: "Login Successful!",
          token: token
         })
        } catch(err){
          console.error(err)
          return res.status(500).json({
            error : "Something Went Wrong"
          })
        }
      }
    )
})



module.exports = router;
