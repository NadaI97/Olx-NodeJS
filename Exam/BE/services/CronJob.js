const schedule = require ('node-schedule');
const moment = require('moment');
const path = require('path');
const sendEmail = require('./sendEmail');
const { createProductsTable } = require('./pdf');
const productModel = require('../DB/Model/product');
const userModel = require('../DB/Model/user');



function cronJobs() {

    const sendDailyProducts = async()=>{
        const today = moment().format('YYYY-MM-DD')

        const products = await productModel.find({
            createdAt: {$gte:today},
            isDeleted: false
        }).select('_id title descrption price')
    
        const admins = await userModel.find({
    
            isDeleted:false,
            isBlocked: false,
            role: 'Admin'
        }).select('_id email')
    
        const pdfPath = path.join(__dirname, `../uploads/PDF/Products`)
        const pdfName = `${today}_products.pdf`
    
        if(products.length> 0 && admins.length>0){
    
            createProductsTable({item: products}, pdfPath, pdfName)
            const adminEmails = admins.map (admin => admin.email)
            const sepratedAdminEmails = adminEmails.join(',')
    
            sendEmail(sepratedAdminEmails, '<p> New products daily report </p>',
            {path: `${pdfPath}/${pdfName}`})
        }else{
    
            console.log("No products added today");
        }
    }
    

    schedule.scheduleJob('59 * * * * *', sendDailyProducts)
}


module.exports = cronJobs