const config = {
    production : {
        SECRET : process.env.SECRET,
        DATABASE : process.env.MONGODB_URI,
        EMAILPASS : process.env.EMAILPASS
    },
    default: {
        SECRET : 'SUPERSECRET',
        DATABASE : 'mongodb://localhost:27017/Alimente'
    }
}

export default function(env){
    return config[env] || config.default
}
