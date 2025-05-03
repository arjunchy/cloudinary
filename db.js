import mongoose from "mongoose";


const connectDB =async ()=>{
    try{
        await mongoose.connect(url)
        console.log("database connected succesfully")
    }catch(error){
        console.log(error)
    }
}

export default connectDB;