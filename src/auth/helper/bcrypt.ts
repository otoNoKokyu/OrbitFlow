
import {genSalt, hash, compare} from 'bcrypt';

const saltOrRounds = 10;
const hashFn = async(password:string) => {
    const salt = await genSalt(saltOrRounds);
    const hashedPwd = await hash(password,salt)
    return hashedPwd
}
const comparePwd = async(hashedPwd: string, actulaPwd:string)=>{
    const matched = await compare(actulaPwd,hashedPwd)
    return matched;
}

export {
    hashFn,
    comparePwd
}