const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt =require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type:String, 
        //custom error msgs for diff conditions we specify
        required:[true,'Please enter an email'],
        unique:true,
        lowercase:true, //if they signup with caps & submit, take the value and store it in db in lowercase
        //3rd party package -> validator
        validate:[isEmail,'PLease enter a valid email']
    },
    password:{
        type:String,
        required:[true,'Please enter a password'],
        minlength:[6,'Minimum password length is 6 characters'],
    },
})

//fire a function before doc saved to db (.post) is another hook)
userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    //must not use arrow function bc context of 'this' is diff
    //this refers to the User created & save inside the signup_post Controller
    this.password= await bcrypt.hash(this.password,salt);
    next();
})

//static method to login user 
//.login is a custom name
userSchema.statics.login = async function(email,password){
    //this refers to the User model itself(not an instance)
    const user = await this.findOne({email:email});

    //check if we do have a user
    if(user){
        //password -> not yet hashed
        //user.password -> hashed password in database
        const auth = await bcrypt.compare(password,user.password);
        if(auth){
            return user
        }
        throw Error('Incorrect password.')
    }
    throw Error('Incorrect email.')
}

//'user' is gonna be pluralized and connect to that collection 
const User = mongoose.model('user',userSchema);

module.exports= User;