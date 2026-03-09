import mongoose from 'mongoose'

const mongoDB = async () => {
    try {
        const uri = process.env.URI
    const result=await mongoose.connect(uri, {
        serverSelectionTimeOutMs:3000
    })
    console.log(result.model)
    console.log("DB connected")
    } catch (error) {
        console.log("fail to connect",error)
    }
    
}

export default mongoDB