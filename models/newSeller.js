import mongoose from "mongoose";

const newSellerSchema = new mongoose.Schema({

});

const newSeller = mongoose.model("new_seller", newSellerSchema);
export default newSeller;