var bcrypt = require('bcrypt')
var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('express')


module.exports={

    doSignup:(detail)=>{
        return new Promise(async(resolve,reject)=>{
            detail.password=await bcrypt.hash(detail.password,10)
            db.get().collection(collection.EMPLOYER_COLLECTIONS).insertOne(detail).then(({insertedId})=>{
                db.get().collection(collection.EMPLOYER_COLLECTIONS).findOne({_id:ObjectId(insertedId)}).then((employer)=>{
                 resolve(employer)
                })
                
                    
                
            })
        })
    },

      doLogin:(logindetail)=>{
        return new Promise(async(resolve,reject)=>
        {
            let response={}
          let user=await db.get().collection(collection.EMPLOYER_COLLECTIONS).findOne({email:logindetail.email})
          if(user)
          {
            bcrypt.compare(logindetail.password,user.password).then((status)=>{
              if(status){
                response.employer=user
                 response.status=true
                 resolve(response)
              } else{
                resolve({status:false,Errmsg:'incorrect password'})
              } 

            })
          }else{
            resolve({status:false,Errmsg:'no account found'})
          }
        })
       
      },
      addjob:(details)=>{
       return new Promise((resolve,reject)=>{
        db.get().collection(collection.JOBS_COLLECTIONS).insertOne(details).then(({insertedId})=>{
          resolve(insertedId)
        })
        
       })
      },
      getJobDetails:(employerid)=>{
        return new Promise(async(resolve,reject)=>{
        let details= await db.get().collection(collection.JOBS_COLLECTIONS).find({employerid:ObjectId(employerid)}).toArray()
        resolve(details)
      })
          

      },
      jobeditdetails:(jobid)=>{
        return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.JOBS_COLLECTIONS).findOne({_id:ObjectId(jobid)}).then((details)=>{
        resolve(details)
      })
        
        })
      },
      updateachange:(details,jobid)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.JOBS_COLLECTIONS).updateOne({_id:ObjectId(jobid)},
           { $set:{
              compname:details.compname,
              companylocation:details.companylocation,
              jobtitle:details.jobtitle,
              timeschedule:details.timeschedule,
              skills:details.skills,
              qualifications:details.qualifications,
              experience:details.experience,
              language:details.language,
              pin:details.pin,
              description:details.description
            }
          }).then((response)=>{
            console.log(response);
            resolve()
          })
         
        })
      },
      deletejob:(jobid)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.JOBS_COLLECTIONS).deleteOne({_id:ObjectId(jobid)}).then(()=>{
            resolve()
          })
        })
      },
      getalljobrqst:(employerId)=>{
        return new Promise(async(resolve,reject)=>{
         let details = await db.get().collection(collection.JOB_REQUESTS).find({employerid:ObjectId(employerId)}).toArray()
         resolve(details)
         
     })
            
           
           },
           getrequestedresume:(resumeid)=>{
            return new Promise((resolve,reject)=>{
          db.get().collection(collection.JOB_REQUESTS).findOne({_id:ObjectId(resumeid)}).then((response)=>{
            resolve(response)
          })
            })
           },
           approvedResumes:(id,detail)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.JOB_REQUESTS).deleteOne({_id:ObjectId(id)}).then(()=>{
                db.get().collection(collection.APPROVED_RESUMES).insertOne(detail)
                resolve()
              })
            })
           },
           rejectresume:(resumedetails,resumeid) =>{
             return new Promise((resolve,reject)=>{
              db.get().collection(collection.JOB_REQUESTS).deleteOne({_id:ObjectId(resumeid)}).then(()=>{
                db.get().collection(collection.REJECTED_RESUMES).insertOne(resumedetails)
                resolve()
              })
             })
           },
           getapproved:(empid)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.APPROVED_RESUMES).find({employerid:empid}).toArray().then((response)=>{
                resolve(response)
              })

            })
           },
           rejectedlist:(empid)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.REJECTED_RESUMES).find({employerid:empid}).toArray().then((response)=>{
                resolve(response)
              })
            })
           },
           count:(id)=>{
              let COUNT={}
            return new Promise(async(resolve,reject)=>{

             let jobs= await db.get().collection(collection.JOBS_COLLECTIONS).find({employerid:ObjectId(id)}).count()
             let jobrequest=await db.get().collection(collection.JOB_REQUESTS).find({_id:ObjectId(id)}).count()
             let approvedresumes=await db.get().collection(collection.APPROVED_RESUMES).find({employerid:id}).count()
             let rejectedresume=await db.get().collection(collection.REJECTED_RESUMES).find({employerid:id}).count()
              COUNT.job=jobs
              COUNT.jobrequest=jobrequest
              COUNT.approvedresumes=approvedresumes
              COUNT.rejectedresume=rejectedresume
              resolve(COUNT)
            })
           }
      }

 
    
