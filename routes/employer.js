var express = require('express');
const { ObjectId } = require('mongodb');
const employerHelper = require('../helpers/employer-helper');
var router = express.Router();
var fs=require('fs');
const e = require('express');



var today=new Date();
var dd=String(today.getDate()).padStart(2,'0');
var mm=String(today.getMonth() +1).padStart(2,'0');
var yy=today.getFullYear();
today= dd + '/' + mm + '/' + yy;

const verifyLogIn = (req, res, next) => {
    if (req.session.employer) {
      next();
    } else {
      res.redirect("/employer/login");
    }
  };

/* GET users listing. */
router.get('/', async function(req, res, next) {
   let employer=req.session.employer; 
   
   if(employer){
    let count=await employerHelper.count(req.session.employer._id)
    console.log(count);
    res.render('employer/home',{employerH:true,employer,count})
   }
   else{
    res.redirect('/employer/login');
   }
   
    
  
});

router.get('/login',(req,res)=>{
    emp=req.session.employer
    if(emp){
      res.redirect('/employer')
    }else{
    
   res.render('employer/login',{msg:req.session.empLoginErr});
    req.session.empLoginErr =false;
    } 
  
});
router.post('/login',(req,res)=>{
let logdetail=req.body
employerHelper.doLogin(logdetail).then((response)=>{
     if(response.status){
        
        req.session.employer=response.employer;
         res.redirect('/employer');
    }else{
        req.session.empLoginErr=response.Errmsg;
        res.redirect('/employer/login');
    }

})
});
router.get('/logout',(req,res)=>{
  req.session.employer=null
  res.redirect('/employer/login')
});
router.get('/signup',(req,res)=>{
    res.render('employer/signup')
});
router.post('/signup',(req,res)=>{
    let detail={...req.body,createdAt:today}
    
    employerHelper.doSignup(detail).then((employer)=>{
        req.session.employer= employer;
       res.redirect('/employer');

    })

});
router.get('/job',verifyLogIn,(req,res)=>{
  employerid=req.session.employer._id
  employerHelper.getJobDetails(employerid).then((jobdetails)=>{
    let employer=req.session.employer;
    console.log(jobdetails);
   res.render('employer/job',{ employerH:true ,jobdetails,employer});
  });
  
});
router.get('/addjob',verifyLogIn,(req,res)=>{

    res.render('employer/addjob',{employerH:true})
});
router.post('/addjob',verifyLogIn,(req,res)=>{
      employerid=ObjectId(req.session.employer._id)
      jobdetails={...req.body,employerid,createdAt:today}
      employerHelper.addjob(jobdetails).then((jobId)=>{
       
        res.redirect('/employer/job');
         if(req.files.Image){
          let image=req.files.Image;
          image.mv('./public/jobImage/' + jobId + '.jpg',(err,done)=>{
            if(!err){
              console.log('image uploaded ')
            }else{
              console.log('something went wrong');
            }
          });
         }
      });
  
});
router.get('/editjob/:id',verifyLogIn,async(req,res)=>{
 var jobid=req.params.id
  employerHelper.jobeditdetails(jobid).then((jobdetail)=>{
    
     res.render('employer/editjob',{jobdetail,employerH:true})
  })
 
 });
 router.post('/editjob/:id',(req,res)=>{
  let id=req.params.id
  
  employerHelper.updateachange(req.body,req.params.id).then(()=>{
    res.redirect('/employer/job')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/jobImage/' + id + '.jpg')
      console.log('image edited successfully');
    }else{
      console.log('error in editing image');
    }

 })
 });
 router.get('/deletejob/:id',(req,res)=>{
    let jobid=req.params.id
    
    employerHelper.deletejob(jobid).then(()=>{
     
      fs.unlink("./public/jobImage/" + jobid + ".jpg", function (err) {
        if (err) console.log("Image delete error", err);
        res.redirect("/employer/job");
        console.log("Image deleted successfully");
      });

    })
 });
 router.get('/jobrequests',verifyLogIn,(req,res)=>{
  employer=req.session.employer
  id=req.session.employer._id

  employerHelper.getalljobrqst(id).then((jobdetails)=>{
    console.log(jobdetails);
   
    res.render('employer/jobrequests',{jobdetails,employer,employerH:true})
  })
 
 });
 router.get('/approverequest/:id',verifyLogIn,async(req,res)=>{
  let id=req.params.id
  let resume=await employerHelper.getrequestedresume(id)
  employerHelper.approvedResumes(id,resume).then(()=>{
   res.redirect('/employer/jobrequests')

  })
  });
  router.get('/rejectrequest/:id',verifyLogIn,async(req,res)=>{
  let id=req.params.id
   let resume=await employerHelper.getrequestedresume(id)
  employerHelper.rejectresume(resume,id).then(()=>{
    res.redirect('/employer/jobrequests')

  })
  });
  router.get('/approvedresumes',verifyLogIn,(req,res)=>{
   let empid=req.session.employer._id
   let employer=req.session.employer
   employerHelper.getapproved(empid).then((approvedresumelist)=>{
    res.render('employer/approvedresumes',{approvedresumelist,employer,employerH:true})
    
   })
  });
  router.get('/rejectedresumes',verifyLogIn,(req,res)=>{
    let empid=req.session.employer._id
   let employer=req.session.employer
   employerHelper.rejectedlist(empid).then((rejdetails)=>{
    res.render('employer/rejectedresumes',{rejdetails,employer,employerH:true})

   })
  });
  
 
 module.exports = router;




