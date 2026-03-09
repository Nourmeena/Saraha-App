import bcrypt from "bcryptjs"

export const generateHash = async({text="",saltRound=process.env.SALT}={}) => {
    return await bcrypt.hashSync(text,parseInt(saltRound))
}

export const compareHash = async ({text="",hash=""}={}) => {
    return await bcrypt.compareSync(text,hash)
}