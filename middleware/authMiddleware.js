const jwt = require('jsonwebtoken');
const User = require('../models/User');

//this middleware is going to check authetication status 
//apply this middleware to any route that requires authentication (protecting routes)
const requireAuth = (req,res,next)=>{

    //grab token from cookies 
    //'jwt' is the name of the cookie
    const token = req.cookies.jwt;

    //check jwt exists & is verified
    if(token){
        //2nd arg is the secret
        jwt.verify(token,'drbaconxd secret',(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.redirect('/login')
            }else{
                //valid token 
                console.log(decodedToken)
                next();
            }
        })
    }else{
        res.redirect('/login');
    }
}

//check current user 
const checkUser = (req,res,next)=>{
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token,'drbaconxd secret',async (err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user =null;
                next();
            }else{
                //valid token 
                console.log(decodedToken)
                //on the decodedToken, we have a payload (the id where we set when we create a jwt) 
                let user = await User.findById(decodedToken.id);
                //now that we have our user, we wanna inject it to our views -> use .locals 
                //.user is a custom variable/property that we wanna make accessible from the views
                res.locals.user = user;
                next();
            }
        })
    }else{
        res.locals.user =null;
        next();
    }
}

module.exports= {requireAuth,checkUser};