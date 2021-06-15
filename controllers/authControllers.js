const User = require('../models/User');
const jwt = require('jsonwebtoken');

//handle erros 
const handleErrors = (err)=>{
    //please rewatch -> https://www.youtube.com/watch?v=nukNITdis9g&list=PL4cUxeGkcC9iqqESP8335DA5cRFp8loyp&index=5
    console.log(err.message,err.code);
    let errors={
        email:'',
        password:'',
    }
    
    //incorrect email 
    if(err.message==='Incorrect email.'){
        errors.email = 'That email is not registered'
    }

    //incorrect password 
    if(err.message==='Incorrect password.'){
        errors.password = 'That password is incorrect'
    }


    //duplicate error code 
    if(err.code ===11000){
        errors.email ="That email is already registered"
        return errors;
    }

    //validation errors
    if(err.message.includes('user validation failed')){
        //destructuring -> ({properties}) == error.properties
        Object.values(err.errors).forEach(({properties})=>{
            // console.log(properties)
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3*24*60*60;//3 days in seconds

const createToken = (id) =>{
    //use id inside payload (header is auto applied)
    //2nd arg is the secret
    //3rd arg is the options obj (like cookie)
    return jwt.sign({id},'drbaconxd secret',{
        expiresIn:maxAge
    })
}

module.exports.signup_get =(req,res)=>{
    res.render('signup');
}

module.exports.login_get =(req,res)=>{
    res.render('login');
}

module.exports.signup_post = async(req,res)=>{
    const {email,password} = req.body;
    
    try{
        //.create() creates am instance of the User locally and then saves it to the db 
        const user = await User.create({email,password});
        const token = createToken(user._id);
        //put our token inside a cookie
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
        res.status(201).json({user:user._id}); //send back json data to the frontend 
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.login_post = async (req,res)=>{
    const {email,password} = req.body;
    
    try{
        const user = await User.login(email,password);
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000});
        res.status(200).json({user:user._id}); //send back json data to the frontend 
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors})
    }
}

module.exports.logout_get= (req,res)=>{
    //we cant delete the jwt cookie from the server 
    //we can REPLACE it with a blank cookie  & a short expiry date (1millisecond)
    res.cookie('jwt','',{maxAge:1})
    res.redirect('/');
}