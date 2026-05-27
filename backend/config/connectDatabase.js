const mongoose = require('mongoose');
const dns = require('dns');

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}


const connectDatabase = () =>{
    mongoose.connect(process.env.DB_URL).then((con)=>{
        console.log("DB Connected to host:"+con.connection.host)
    })
};

module.exports = connectDatabase;