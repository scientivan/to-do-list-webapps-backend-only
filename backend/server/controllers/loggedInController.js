exports.mainpage = async () => {
    const list = await toDoModel.find({'user_id' : req.session.user_id})
    console.log()
    res.render('home',{
        layout : 'layouts/main-layout',
        title : 'Home Page',
        list : list,
        msg: req.flash('msg')
    })
}

exports.sort = async () => {
    if(req.params.sort == "due_date"){
        const list = await toDoModel.find({'user_id' : req.session.user_id}).sort({due_date : 1})  
        res.render('home',{
            layout : 'layouts/main-layout',
            title : 'Home Page',
            list : list,
            msg: req.flash('msg')
        })
    }
    else if(req.params.sort == "priority_level"){
        const list = await toDoModel.find({'user_id' : req.session.user_id}).sort({priority_level: -1})  
        res.render('home',{
            layout : 'layouts/main-layout',
            title : 'Home Page',
            list : list,
            msg: req.flash('msg')
        })
    }
}

exports.add = () => {
    res.render('add-todo',{
        layout : 'layouts/main-layout',
        title : 'Add to To Do List Page',
        user_id : req.session.user_id
    })
}

exports.addData = async () => {
    if (req.body.priority == "Low") {
        req.body.priority_level = 1
    } else if (req.body.priority == "Mid") {
        req.body.priority_level = 2
    } else if (req.body.priority == "High") {
        req.body.priority_level = 3  
    }
    await toDoModel.insertMany(req.body)
    res.redirect('/')
}

exports.edit = async () => {
    const list = await toDoModel.findOne({'title' : req.params.title})
    res.render('edit-todo',{
        layout : 'layouts/main-layout',
        title : 'Edit To Do List Page',
        id : list._id,
        list : list,
    })
}

exports.editData = async () => {
    var currentdate = new Date(); 
    const date = currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear()

    const time = currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds(); 
    
    await toDoModel.updateOne({"user_id" : req.session.user_id, "_id" : req.body.todo_id },{
        $set : {
            title : req.body.title,
            description : req.body.description,
            due_date : req.body.due_date,
            priority : req.body.priority,
            updated_at : date + '@' + time
        }
    })
    req.flash('msg',"Sucessfully updated!")
    res.redirect('/')
}


exports.deleteData = async () => {
    console.log(req.body.todo_id)
    const isTask = await toDoModel.findById(req.body.todo_id)
    if(!isTask){
        //kalok yang mau dihapus  gaada
        req.flash('msg','Failed to delete the task')
        res.redirect('/')
    }
    else{
        //kalok yang dihapus ada
        await toDoModel.deleteOne({'_id' : req.body.todo_id})
        req.flash('msg','To do task is suscessfully deleted')
        res.redirect('/')
    }
}

exports.deleteCompletedData = async () => {
    const isTask = await completedModel.findById(req.body.todo_id)
    if(!isTask){
        //kalok yang mau dihapus  gaada
        req.flash('msg','Failed to delete the task')
        res.redirect('/')
    }
    else{
        //kalok yang dihapus ada
        await completedModel.deleteOne({'_id' : req.body.todo_id})
        req.flash('msg','To do task is suscessfully deleted')
        res.redirect('/')
    }
}

exports.statusById = async () => {
    var currentdate = new Date(); 
    const date = currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear()
    const time = currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds();  
    
    const task = await toDoModel.findById(req.params.id)
    if(task){
        task.updated_at = date + "@" + time
        
        await completedModel.insertMany(task)
        await toDoModel.deleteOne({'_id' : req.params.id})
        res.redirect('/')
    }
    else{
        const successfullTask = await completedModel.findById(req.params.id)
        if(successfullTask){
            successfullTask.updated_at = date + "@" + time
            await toDoModel.insertMany(successfullTask)
            await completedModel.deleteOne({'_id' : req.params.id})
            res.redirect('/completed')
        }
    }
}
