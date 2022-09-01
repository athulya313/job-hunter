var collection = require('../config/collection');
var db = require('../config/connection');
var bcrypt=require('bcrypt');
const { ObjectId } = require('mongodb')
const { response } = require('express')


module.exports={
    doLogin:(logindetail)=>{
        return new Promise(async(resolve,reject)=>
        {
            let response={}
          let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:logindetail.email})
          if(admin)
          {
            bcrypt.compare(logindetail.password,admin.password).then((status)=>{
              if(status){
                response.admin=admin
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
   doRegister:(admindetails)=>{
    return new Promise(async(resolve,reject)=>{
        admindetails.password= await bcrypt.hash(admindetails.password,10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(admindetails).then(({insertedId})=>{
            db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:ObjectId(insertedId)}).then((admin)=>{
                resolve(admin)
            })
           
        })
    })
   },
   getallusers:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTIONS).find().toArray().then((response)=>{
            resolve(response)
        })
    })
   },
   allemployers:()=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.EMPLOYER_COLLECTIONS).find().toArray().then((response)=>{
            resolve(response)
        })
    })
   },
   getemployer:(id)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.EMPLOYER_COLLECTIONS).findOne({_id:ObjectId(id)}).then((employer)=>{
        resolve(employer)
      })
      })
   },
   banemployer:(id,employer)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.EMPLOYER_COLLECTIONS).deleteOne({_id:ObjectId(id)}).then(()=>{
         db.get().collection(collection.BANNED_EMPLOYER).insertOne(employer).then(()=>{
            resolve()
         })
        })
        
    })
   },
   deleteemployer:(id)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.EMPLOYER_COLLECTIONS).deleteOne({_id:ObjectId(id)}).then(()=>{
        resolve()
      })
    })
   },
   banuser:(id)=>{
    return new Promise((resolve,reject)=>{
      console.log(id);
      db.get().collection(collection.USER_COLLECTIONS).findOne({_id:ObjectId(id)}).then((response)=>{
      db.get().collection(collection.USER_COLLECTIONS).deleteOne({_id:ObjectId(id)}).then(()=>{
        db.get().collection(collection.BANNED_USERS).insertOne(response).then(()=>{
          resolve()
        })
      })
        
      })
    })
   },
   deleteuser:(id)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.USER_COLLECTIONS).deleteOne({_id:ObjectId(id)}).then(()=>{
         resolve()
      })
    })
   },
   allbannedusers:()=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.BANNED_USERS).find().toArray().then((users)=>{
      resolve(users)
      })
    })
   },
   allbannedemployer:()=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.BANNED_EMPLOYER).find().toArray().then((employer)=>{
        resolve(employer)
      })
    })
   },
   unbanemployer:(empid)=>{
    return new Promise(async(resolve,reject)=>{
      let emp=await db.get().collection(collection.BANNED_EMPLOYER).findOne({_id:ObjectId(empid)})
      db.get().collection(collection.BANNED_EMPLOYER).deleteOne({_id:ObjectId(empid)}).then(()=>{
        db.get().collection(collection.EMPLOYER_COLLECTIONS).insertOne(emp).then(()=>{
          resolve()
        })
      })
    })
   },
   unbanuser:(userid)=>{
    return new Promise(async(resolve,reject)=>{
      let user=await db.get().collection(collection.BANNED_USERS).findOne({_id:ObjectId(userid)})
      db.get().collection(collection.BANNED_USERS).deleteOne({_id:ObjectId(userid)}).then(()=>{
        db.get().collection(collection.USER_COLLECTIONS).insertOne(user).then(()=>{
          resolve()
        })
      })
    })
   },
   viewjob:(empid)=>{
    console.log(empid);
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collection.JOBS_COLLECTIONS).find({employerid:ObjectId(empid)}).toArray().then((response)=>{
       console.log(response);
        resolve(response)
      
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
   getcount:()=>{
    let COUNT={}
     return new Promise(async(resolve,reject)=>{
      
      let user=await db.get().collection(collection.USER_COLLECTIONS).count()
      let employer=await db.get().collection(collection.EMPLOYER_COLLECTIONS).count()
      let banemployer=await db.get().collection(collection.BANNED_EMPLOYER).count()
      let banuser=await db.get().collection(collection.BANNED_USERS).count()
      COUNT.user=user
      COUNT.employer=employer
      COUNT.bannedUser=banuser
      COUNT.banemployer=banemployer
      
      resolve(COUNT)
     })
   }

}
