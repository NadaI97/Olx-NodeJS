const userModel = require("../../../DB/Model/user");
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');


const updatePassword = async (req, res)=>{

    try {
        const {oldPassword, newPassword}= req.body;

        const findUser = await userModel.findById(req.user._id)
        
        if(!findUser)
        {
         res.status(404).json({message:"User does not exist"})
        }
        else
        {
            const compare = await bcrypt.compare(oldPassword , findUser.password);
            if(compare){
                
                 const hashPassword = await bcrypt.hash(newPassword, parseInt(process.env.saltRound))
                 await userModel.findByIdAndUpdate(req.user._id , { password: hashPassword })
     
                    res.status(200).json({message:"Updated"})
            }else{
                
                res.status(400).json({message:"Your Password is incorrect"})

            }
        }
    } catch (error) {
        res.status(500).json({message:"Error", error})

    }
     
    }
   
const updateProfile = async (req, res)=>{

   try {
    const {firstName, lastName} = req.body;
    const findUser = await userModel.findById (req.user._id);

    if (!findUser || findUser.isDeleted ) {
        
        res.json({message:"User not found"})
    } else {
        
        await userModel.findByIdAndUpdate(findUser._id , {firstName: firstName , lastName:lastName}, {new:true} )

        res.json({message: "Updated"})
    }
   } catch (error) {
            res.status(500).json({message:"Error", error})

   }
    

}

const updateEmail = async (req, res)=>{

    try {
     const {email} = req.body;
     const findUser = await userModel.findById (req.user._id);
 
     if (!findUser || findUser.isDeleted ) {
         
         res.json({message:"User not found"})
     } else {
         
        const findEmail =  await userModel.findOne({email})
                     if(findEmail)
                     {
                         res.status(409).json({message:"Email is already existed"}) 
                     }
                     else
                     {
                          await userModel.findByIdAndUpdate(req.user._id , {email , confirmEmail : false})
             
                         const token = jwt.sign({_id:req.user._id}, process.env.emailToken, {expiresIn: 5 * 60})
                         const URL = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`
                         const message = `<a href=${URL}>Please click here to confirm your email</a>` 
             
                         //sendEmail(email,message)
                         res.status(200).json({message:"Updated, please confirm your new email"})
                     }
     }
    } catch (error) {
             res.status(500).json({message:"Error", error})
 
    }
     
 
 }
    const sendCode = async (req, res)=>{

       try {
        const {email} = req.body;
        const user = await userModel.findOne ({email});
    
        if (!user){
            res.status(404).json ({message : "In-valid email"})
        }else{
    
            const code = Math.floor (Math.random()* (9999 - 1000 +1)+1000);
            const message = `<p> Please find your code to change your password ${code} </p>`
            await userModel.findByIdAndUpdate(user._id , {code});
    
    
            sendEmail(email, message)
            res.status(200).json ({message : "Done"})
    
        }
       } catch (error) {
        res.status(500).json({message:"Error", error})
       }
    }
    
const forgetPassword = async (req, res)=>{
    try {
       
   const {email, code, newPassword} = req.body;
   const user = await userModel.findOne ({email});
   if (!user){
       res.status(404).json ({message : "In-valid email"})
   }else{

       if(user.code.toString() != code.toString()){
           res.status(409).json ({message : "code is incorrect"})

       }else{
           const hashedPassword = await bcrypt.hash(newPassword, parseInt (process.env.saltRound))

           await userModel.findByIdAndUpdate (user._id, {password : hashedPassword, code : ""})

           res.status(200).json ({message : "Done, You can login to your account now"})

       }
       

   }
    } catch (error) {
       
       res.status(500).json ({message : "Catch error", error})

    }

}


const updateProfilePic = async (req, res) => {

try {
    if (req.fileValidation) {
        res.json({ message: "in-valid file format" })
    } else {

        const imageUrls = []
        for (let i = 0; i < req.files.length; i++) {
            imageUrls.push(`${req.destinationFile}/${req.files[i].filename}`)
        }
        const user = await userModel.findOneAndUpdate({ _id: req.user._id }, { profilePic: imageUrls }, { new: true })
        res.json({ message: "Done", user })
    }

} catch (error) {
    
    res.status(500).json({message:"Error", error})
}

}



const updateProfileCoverPic = async (req, res) => {
   
    try {
        
    if (req.fileValidation) {
        res.json({ message: "in-valid file format" })
    } else {
        const imageUrls = []
        for (let i = 0; i < req.files.length; i++) {
            imageUrls.push(`${req.destinationFile}/${req.files[i].filename}`)
        }
        const user = await userModel.findOneAndUpdate({ _id: req.user._id }, { coverPic: imageUrls }, { new: true })
        res.json({ message: "Done", user })
    }
    } catch (error) {
        
        res.status(500).json({message:"Error",error})
    }
}

module.exports={

    updateProfile,
    updateProfilePic,
    updateProfileCoverPic,
    forgetPassword,
    sendCode,
    updateEmail,
    updatePassword
}