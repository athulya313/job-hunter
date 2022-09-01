var bcrypt = require('bcrypt')
var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')


module.exports={
    emailExist:(email)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.USER_COLLECTIONS).findOne({Email:email}).then((res)=>{
              if(!res){
                resolve({status:true})
              }else{
                resolve({status:false,Errmsg:"Email already exist"})
              }
           })
        })
    },
    doSignup:(userdetail)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userdetail);
           userdetail.Password=await bcrypt.hash(userdetail.Password,10)
           db.get().collection(collection.USER_COLLECTIONS).insertOne(userdetail).then(({insertedId})=>{
            console.log(insertedId);
            db.get().collection(collection.USER_COLLECTIONS).findOne({_id:ObjectId(insertedId)}).then((user)=>{
                resolve(user)
            })
            
           })
        })

    },
    doLogin:(detail)=>{
    return new Promise(async(resolve,reject)=>{
        let response={}
       let user= await db.get().collection(collection.USER_COLLECTIONS).findOne({Email:detail.Email})
        if(user){
            bcrypt.compare(detail.Password,user.Password).then((status)=>{
                if(status){
                response.user=user
                response.status=true
                resolve(response)
                }else{
                    console.log("incorrect password");
                    resolve({status:false,Errmsg:"incorrect password"})
                }
            })
        }else{
            console.log("incorrect account");
            resolve({status:false,Errmsg:"account not found"})
        }

    })
    },
    getJobs:()=>{
        return new Promise(async(resolve,reject)=>{
         let jobs=await db.get().collection(collection.JOBS_COLLECTIONS).find().toArray()
         let count=await db.get().collection(collection.JOBS_COLLECTIONS).countDocuments()
         
         resolve({jobs,count});

        })
    },
    getjobdetail:(id)=>{
        return new Promise((resolve,reject)=>{
            let details=db.get().collection(collection.JOBS_COLLECTIONS).findOne({_id:ObjectId(id)})
            resolve(details)
        })
    },
    appliedjob:(details)=>{
        return new Promise((resolve,reject)=>{
            details.userId=ObjectId(details.userId)
            details.jobId=ObjectId(details.jobId)
            details.employerid=ObjectId(details.employerid)
         db.get().collection(collection.JOB_REQUESTS).insertOne(details).then(({insertedId})=>{
            resolve(insertedId)
         })
            
        })
    },
    rejectedjoblist:(userid)=>{
        return new Promise(async(resolve,reject)=>{
          let jobs=await db.get().collection(collection.REJECTED_RESUMES).aggregate([
            {
                $match:{userId:ObjectId(userid)}
            },
            {
                $lookup:{
                    from:collection.JOBS_COLLECTIONS,
                    foreignField:'_id',
                    localField:'jobId',
                    as:'rejectedjobs',
                }
            },
            {
                $project:{
                    rejectedjobs:{$arrayElemAt:['$rejectedjobs',0]}
                }
            }
           ]).toArray()
           resolve(jobs)
           
            })
        
            
         
            
                
            
                
            
        
    },
    approvedjoblist:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let jobs=await db.get().collection(collection.APPROVED_RESUMES).aggregate([
                {
                    $match:{userId:ObjectId(id) }
                },
                

                {
                    $lookup:{
                        from:collection.JOBS_COLLECTIONS,
                        localField:"jobId",
                        foreignField:"_id",
                        as:'appliedjobs'
                         }
                },
                {
                    $project:{
                        appliedjobs:{$arrayElemAt:['$appliedjobs',0]}
                    }
                }
                
            ]).toArray()
            
              resolve(jobs)
        
            
           })
           
           
            

       
},
appliedjoblist:(id)=>{
    return new Promise(async(resolve,reject)=>{
        let jobs=await db.get().collection(collection.JOB_REQUESTS).aggregate([
            {
                $match:{
                   userId:ObjectId(id)
                }
            },
            {
                $lookup:{
                    from:'job',
                    localField:'jobId',
                    foreignField:'_id',
                    as:'appliedjobs'
                }
            },
            {
                $project:{
                    appliedjobs:{$arrayElemAt:['$appliedjobs',0]}
                }
            }
        ]).toArray()
        
        resolve(jobs)
       
    
    })
    
},
getrandomjobs:()=>{
    return new Promise(async(resolve,reject)=>{
        let jobs=await db.get().collection(collection.JOBS_COLLECTIONS).aggregate([
            {
                $sample:{
                    size:5
                }
            }
        ]).toArray()
        resolve(jobs)
    })
}
    


}
