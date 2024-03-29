import React,{useState} from 'react';
import {Redirect, Link} from 'react-router-dom';
import Layout from "../core/Layout";
import {signin,authenticate, isAuthenticated} from '../auth/index';
import "../styles.css";
const Signin=()=>{
    const [values,setValues]=useState({
        email:'',
        password:'',
        error:'',
        loading:false,
        redirectToReferrer:false
    })

    const {email,password,loading,redirectToReferrer,error}=values

    const {user}=isAuthenticated()

    const handleChange= name => event =>{
        setValues({...values,error:false,[name]:event.target.value});
    }

   

    const clickSubmit=(event) =>{
        event.preventDefault()
        setValues({...values,error:false,loading:true})
        signin({email,password})
        .then(data=>{
            if(data.error){
                setValues({...values,error:data.error,loading:false})
            }else{
                authenticate(data,()=>{
                    setValues({
                        ...values,
                        redirectToReferrer:true,
                        
                    })
                })
               
            }
        })
    }

    const signInForm=()=>(
        <form>

            <div className="form-group">
                <label className="text-muted">Email</label>
                <input onChange={handleChange('email')} type="email" value={email} className="form-control"/>
            </div>
            <div className="form-group">
                <label className="text-muted">Password</label>
                <input onChange={handleChange('password')} type="password" value={password} className="form-control"/>
            </div>
            <div className="">
            <button onClick={clickSubmit} className="btn btn-primary btn-lg">
                Submit    
            </button> 

            <span className="float-right forgot"><Link to="/forgot">Forgot Password</Link></span>
            </div>
        </form>
    )

    const showError=()=>(
        <div className="alert alert-danger" style={{display:error?'':'none',textAlign:"center"}}>
            {error}
        </div>
    )

    
    const showLoading=()=>
        loading && (
            <div className="alert alert-info">
                <h2>Loading...</h2>
            </div>
        )


    const redirectUser=()=>{
        if(redirectToReferrer){
           if(user && user.role===1){
            return <Redirect to="/admin/dashboard" />
           }else{
            return <Redirect to="/user/dashboard" />
           }
        }
        if(isAuthenticated()){
            return <Redirect to="/"/>
        }
    }
    return(
    <Layout title="SignIn" description="SignIn to Node React E-commerce App" className="container col-md-8 offset-md-2">
        {showLoading()}
        {showError()}
        {signInForm()}
        {redirectUser()}
    </Layout>
   )
}


export default Signin;