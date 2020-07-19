import React,{useState,useEffect} from 'react';
import { getBraintreeClientToken, processPayment, createOrder } from './apiCore';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from "braintree-web-drop-in-react";
import { emptyCart } from './cartHelper';

const Checkout=({ products, setRun = f => f, run = undefined })=>{

    const [data,setData]=useState({
        success:false,
        clientToken:null,
        loading:false,
        error:'',
        instance:{},
        address:''
    })

    const userId=isAuthenticated() && isAuthenticated().user._id
    const token=isAuthenticated() && isAuthenticated().token

    const getToken=(userId,token)=>{
        getBraintreeClientToken(userId,token).then(data=>{
            if(data.error){
                setData({...data,error:data.error})
            }else{
                setData({clientToken:data.clientToken})
            }
        })
    }

    useEffect(()=>{
        getToken(userId,token)
    },[])

    const getTotal=()=>{
        return products.reduce((currentValue,nextValue)=>{
            return currentValue+nextValue.count*nextValue.price;
        },0)
    }

    let deliveryAddress=data.address

    const buy=()=>{

        setData({loading:true})

        let nonce;
        let getNonce=data.instance.requestPaymentMethod()
        .then(data=>{
            nonce=data.nonce
            const paymentData={
                paymentMethodNonce:nonce,
                amount:getTotal(products)
            } 
            processPayment(userId,token,paymentData)
            .then(response=>{
                const createOrderData={
                    products:products,
                    transaction_id:response.transaction.id,
                    amount:response.transaction.amount,
                    address:deliveryAddress

                }

                createOrder(userId,token,createOrderData)
                .then(response=>{

                    setData({...data,success:response.success})
                    emptyCart(()=>{
                        setRun(!run)
                        console.log('payment success and empty cart')
                        setData({loading:false,success:true})
    
                    })
                })
            })
            .catch(err=>{
                console.log(err)
                setData({loading:false})
            })   
        })
        .catch(error=>{
            //console.log("dropin error: ",error);
            setData({...data,error:error.message})
        })
    }

    const handleAddress=event=>{
        setData({...data,address:event.target.value})
    }

    const showDropIn=()=>(
        <div onBlur={()=>setData({...data,error:''})}>
            {data.clientToken !== null && products.length>0 ? (
                <div>
                    <div className="gorm-group mb-3">
                        {/* <label className="text-muted">Delivery address</label> */}
                        <textarea
                            onChange={handleAddress}
                            className="form-control"
                            value={data.address}
                            placeholder="Type your delivery address here ..."
                            />
                    </div>


                    <DropIn options={{
                    authorization:data.clientToken,
                    paypal:{
                        flow:"vault"
                    }
                }} onInstance={instance=>data.instance=instance}/>
                <button onClick={buy} className="btn btn-success btn-block">Pay</button>
                </div>
            ): null}
        </div>
    )

    const showCheckout=()=>{
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ):(
            <Link to="/signin">
            <button className="btn btn-primary">Sign in to Checkout</button>
            </Link>
        )
        }


    const showError=error=>(
        <div className="alert alert-danger" style={{display:error?'':'none'}}>
            {error}
        </div>
    )

    const showSuccess=success=>(
        <div className="alert alert-info"
         style={{display:success?'':'none'}}>
            Thanks! Your payment was successful!
        </div>
    )

    const showLoading=(loading)=>loading && <h2>Loading...</h2>

    return <div>
        
        <h2 className="float-left">Total: ${getTotal()}</h2>
       <Link to="/shop"><button className="btn btn-primary btn-lg mb-4 float-right">Continue Shopping</button></Link> 
        
        {showLoading(data.loading)}
    {showError(data.error)}
    {showSuccess(data.success)}
    {showCheckout()}
       
    </div>

}

export default Checkout;