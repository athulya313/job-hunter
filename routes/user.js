const e = require('express');
var express = require('express');
const employerHelper = require('../helpers/employer-helper');
var router = express.Router();
const userHelper = require("../helpers/user-helpers");



var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();

today = dd + "/" + mm + "/" + yyyy;

/* GET home page. */
const verifyLogIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get('/', async function(req, res, next) {
  if(req.session.user){
   let jobs=await userHelper.getrandomjobs()
   
   res.render('user/home',{userH:true,jobs});
  }else{
    res.redirect('/login');
  }
});
router.get('/signup',(req,res)=>{
  res.render('user/signup',{msg:req.session.loginErr});
});
router.post('/signup',(req,res)=>{
  let userEmail=req.body.Email
  console.log(userEmail);
  userHelper.emailExist(userEmail).then((response)=>{
    console.log(response);
    if(response.status){
         let userinfo=req.body
      userHelper.doSignup(userinfo).then((user) =>{
        console.log(user);
        req.session.user= user;
        res.redirect('/');
 });
}else{
      req.session.loginErr=response.Errmsg 
      res.redirect('/signup') ;
    
    }

  })
  
});
router.get('/login',(req,res)=>{
  res.render('user/login',{msg:req.session.loginErr})
});
router.post('/login',(req,res)=>{
   let logindetail=req.body
    userHelper.doLogin(logindetail).then((response)=>{
       if(response.status){
        req.session.user=response.user
          res.redirect('/')
       }else{
        req.session.loginErr=response.Errmsg
        res.redirect('/login')
       }

    })
});
router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/login')
});
router.get('/getjob',verifyLogIn,(req,res)=>{
  userHelper.getJobs().then((response)=>{
    jobs=response.jobs
    count=response.count
    res.render('user/getjobs',{jobs,count,userH:true})

  }) 
});
router.get('/jobdetails/:id',verifyLogIn,(req,res)=>{
let id=req.params.id
console.log(id);
employerHelper.jobeditdetails(id).then((details)=>{
  res.render('user/jobdetails',{details,userH:true})
})
});
router.get('/applyjob/:id',verifyLogIn,(req,res)=>{
  let jobid=req.params.id
  let userid=req.session.user._id
   userHelper.getjobdetail(jobid).then((response)=>{
    details=response
    res.render('user/applyjob',{details,userid,userH:true})
   })
  
});
router.post('/applyjob',(req,res)=>{
  let Image=req.files.Image
  let Resume=req.files.Resume
  let det={...req.body,createdAt:today}
  userHelper.appliedjob(det).then((id)=>{
    console.log(id);
    if( Image||Resume ){
      Image.mv("./public/ResumeImages/" + id + ".jpg");
    
      Resume.mv('./public/Resume/'+ id+'.pdf')
       console.log('saved ');
       res.render('user/applied')
    } 
       else{
        console.log('someting went wrong');
       }


    }

  )
  });
  router.get('/jobstatus',verifyLogIn,async(req,res)=>{
    let id=req.session.user._id
    let appliedjobs=await userHelper.appliedjoblist(id)
    
    let rejectedjobs=await userHelper.rejectedjoblist(id)
    
    
    let approvedResumes=await userHelper.approvedjoblist(id)
    
    res.render('user/jobstatus',{ userH:true,appliedjobs,approvedResumes, rejectedjobs})


  });
  
 



module.exports = router;
