var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helper');


const verifyLogIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

/* GET users listing. */
router.get('/',async function(req, res, next) {
  if(req.session.admin){
  await adminHelpers.getcount().then((Count)=>{
    console.log(Count);
    res.render('admin/home',{adminH:true,Count})
   })
   
  }else{
    res.redirect('/admin/login')
  }
 
});
router.get('/login',(req,res)=>{
  admin=req.session.admin
  if(admin){
    res.redirect('/admin ')
  }else{
    res.render('admin/login',{msg:req.session.empLoginErr})
    req.session.empLoginErr=false
  }
  
});
router.post('/login',(req,res)=>{
    adminHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.admin=response.admin
        res.redirect('/admin')
      }else{
        req.session.empLoginErr =response.Errmsg;
        res.redirect('/admin/login')
      }

    })
});
router.get('/logout',(req,res)=>{
  req.session.admin=null
  res.redirect('/admin/login')
})
router.get('/register',(req,res)=>{
  res.render('admin/register')
});
router.post('/register',(req,res)=>{
  adminHelpers.doRegister(req.body).then((admin)=>{
    req.session.admin=admin;
    res.redirect('/admin');

  })
})
router.get('/allusers',verifyLogIn,(req,res)=>{
  adminHelpers.getallusers().then((users)=>{
    res.render('admin/allusers',{users,adminH:true})

  })
  
});
router.get('/allemployers',verifyLogIn,(req,res)=>{
  adminHelpers.allemployers().then((employers)=>{
   res.render('admin/allemployers',{employers,adminH:true})

  })
});
router.get('/banemployers',verifyLogIn, async(req,res)=>{
  let id=req.query.id
  let employer=await adminHelpers.getemployer(id)
  adminHelpers.banemployer(id,employer).then(()=>{
    res.redirect('/admin/allemployers')
  });
  router.get('/deleteemployer',verifyLogIn,(req,res)=>{
    let id=req.query.id
    console.log(id);
    adminHelpers.deleteemployer(id).then(()=>{
      res.redirect('/admin/allemployers')

    })
  });
  
  router.get('/banusers',verifyLogIn,async(req,res)=>{
    let userid=req.query.id
   await adminHelpers.banuser(userid).then(()=>{
    res.redirect('/admin/allusers');
   })
    
    
  });
  router.get('/delete-user',(req,res)=>{
    let id=req.query.id
    adminHelpers.deleteuser(id).then(()=>{
      res.redirect('/admin/allusers')
    })
    
  })
});
router.get('/settings',verifyLogIn,async(req,res)=>{
  let banneduser=await adminHelpers.allbannedusers()
  let bannedemployee=await adminHelpers.allbannedemployer()
  
  res.render('admin/settings',{adminH:true,bannedemployee,banneduser })
});
router.get('/unbanemployer',(req,res)=>{ 
  id=req.query.id
adminHelpers.unbanemployer(id).then(()=>{
  res.redirect('/admin/settings');

})
});
router.get('/unbanuser',(req,res)=>{
 let id=req.query.id
 adminHelpers.unbanuser(id).then(()=>{
  res.redirect('/admin/settings');

 })
});
router.get('/viewjobs',verifyLogIn,(req,res)=>{
  id=req.query.id
  adminHelpers.viewjob(id).then((job)=>{
    console.log(job);
    res.render('admin/viewjobs',{adminH:true,job})

  })
})
router.get('/deletejob/:id',verifyLogIn,(req,res)=>{
 let jobid= req.params.id
 console.log(jobid);
 adminHelpers.deletejob(jobid).then(()=>{
  res.redirect('/admin/viewjobs')

 })
})

module.exports = router;
