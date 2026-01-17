function generatePassword()
{
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&"
    let length = chars.length ;

    let password = "" ;

    for(let i=0;i<8;i++)
    {
        const idx = Math.floor(Math.random()*length) ;
        password += chars[idx] ;
    }

    return password ;
}

module.exports = generatePassword ;