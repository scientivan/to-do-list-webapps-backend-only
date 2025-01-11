const mongoose = require('mongoose')

//kurang todo_id sama user_id
const userModel = mongoose.model('users',{
    // ada variabel user_id dari req.sessions.user_id yang diambil dari mongo
    'google_id' : {
        type : String,
        required : false
    },
    'nama' : {
        type : String,
        required : true
    },
    'email' : {
        type : String,
        required : true
    },
    'noHP' : {
        type : String,
        required : false
    },
    'password' : {
        type : String,
        required : false
    },
    'created_at' : {
        type : String,
        required : true,
    },
})

const toDoModel = mongoose.model('todo',{
    // id dah dibuatin otomatis
    'user_id' : {
      type : String, // harus ngambil id user nya dari cookies
      required : true,
    },
    'title' : {
        type : String,
        required : true
    },
    'description' : {
        type : String,
    },
    'due_date' : {
        type : String,
    },
    'priority' : {
        type : String,
        required : true,
    },
    'priority_level' : {
        type : String,
    },
    'is_complete' : {
        type : String,
    },
    'created_at' : {
        type : String,
        required : true,
    },
    'updated_at' : {
        type : String,
    },
})

const completedModel = mongoose.model('completed',{
    // id dah dibuatin otomatis
    'user_id' : {
      type : String, // harus ngambil id user nya dari cookies
      required : true,
    },
    'title' : {
        type : String,
        required : true
    },
    'description' : {
        type : String,
    },
    'due_date' : {
        type : String,
    },
    'priority' : {
        type : String,
    },
    'is_complete' : {
        type : String,
    },
    'created_at' : {
        type : String,
        required : true,
    },
    'updated_at' : {
        type : String,
    }
})

module.exports = {userModel,toDoModel,completedModel}