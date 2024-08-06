const mongoose=require("mongoose")

const cartSchema=new mongoose.schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    guestId:String,
    items:[{
        productId:{
            type:mongoose.Schema.Type.ObjectId,
            ref:"Product"
        },
        price:{
            type:Number,
            required:true,
        },
        countinstock: { type: Number, min: [1, 'Quantity must be above 0'] },
        totalPrice:{
            type:String,
            required:true,
        }
    },{timestamps:true}
    ]
})

module.exports=mogoose.model("Cart",cartSchema)