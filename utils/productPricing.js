import { config } from "dotenv";
config();

export const productPricing = productData => {
    const LOCAL_COMMISSION_RATE = parseFloat(process.env.LOCAL_COMMISSION_RATE);
    const DEFAULT_COMMISSION_RATE = parseFloat(process.env.DEFAULT_COMMISSION_RATE);
    const DEFAULT_DELIVERY_CHARGE = parseFloat(process.env.DEFAULT_DELIVERY_CHARGE);
    const LOCAL_DELIVERY_CHARGE = parseFloat(process.env.LOCAL_DELIVERY_CHARGE);

    const RAZORPAY_CHARGE = parseFloat(process.env.RAZORPAY_CHARGE);

    let localPrice = 0;
    let defaultPrice = 0;

    const { mrp , sellerPrice } = productData;

    const defaultCommissionCharge = sellerPrice + (sellerPrice * DEFAULT_COMMISSION_RATE);
    const totalDefaultCharge = defaultCommissionCharge + DEFAULT_DELIVERY_CHARGE;
    
    const localCommissionCharge = sellerPrice + (sellerPrice * LOCAL_COMMISSION_RATE);
    const totalLocalCharge = localCommissionCharge + LOCAL_DELIVERY_CHARGE;

    defaultPrice += totalDefaultCharge/ (1 - (RAZORPAY_CHARGE / 100));
    localPrice += totalLocalCharge / (1 - (RAZORPAY_CHARGE / 100));

    defaultPrice = Math.ceil(defaultPrice);
    localPrice = Math.ceil(localPrice);

    let deliveryCharge = 0;
    let localDeliveryCharge = 0;

    if(defaultPrice > mrp){
        deliveryCharge = defaultPrice - mrp;
        defaultPrice = mrp;
        if(defaultPrice - 9 > 0){
            deliveryCharge += 9;
            defaultPrice = defaultPrice - 9;
        }
    }
    
    if(localPrice > mrp){
        localDeliveryCharge = localPrice - mrp;
        localPrice = mrp;
        if(localPrice - 9 > 0){
            localDeliveryCharge += 9;
            localPrice = localPrice - 9;
        }
    }

    return {
        mrp,
        sellerPrice,
        
        defaultPrice,
        deliveryCharge,
        
        localPrice,
        localDeliveryCharge,
    }
}