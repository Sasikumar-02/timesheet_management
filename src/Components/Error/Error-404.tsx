import React from 'react'
import error from "../../assets/images/error.svg";
import "../Styles/Error.css";


const Error404: React.FC = () => {
  return (

    <div>
        <div id="e404"> <img src={error} alt="error" style={{width:500 , height:500 ,display:'block',marginLeft:'auto',marginRight:'auto' }}/> </div>
           <div> <h2>Page Not Found</h2> </div>
           <div>
            <p>We regret to inform you that the page you are trying to access has encountered an issue. </p>
            <p> It may have been relocated, removed, renamed, or it could be</p>
            <p> that the page never existed in the first place.</p> 
            </div>
    </div>
  )
}

export default Error404