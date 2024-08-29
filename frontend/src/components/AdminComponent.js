import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminComponent() {
    const navigate = useNavigate('')
    const handleCategory = ()=>{
        navigate("/cat")
    }
    const handleUsers = ()=>{
        navigate("/allusers")
    }
  return (
    <>
    <h1 className='text-center my-4'> Admin Page</h1>
        <div className='container d-flex justify-content-center align-items-center' style={{gap:"20px",marginTop:"10%"}}>
            <button type="button" class="btn btn-info" onClick={handleUsers}>View Users</button>
            <button type="button" class="btn btn-info" onClick={handleCategory}>Add Category</button>
        </div>
    </>
  )
}
