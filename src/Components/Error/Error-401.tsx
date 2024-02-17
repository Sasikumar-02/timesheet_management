import React from 'react'
import error401 from "../../assets/images/error401.svg";
import "../Styles/Error.css";


const Error401: React.FC = () => {
  return (

    <div>
        <div id="e404"> <img src={error401} alt="error" style={{width:500 , height:500 ,display:'block',marginLeft:'auto',marginRight:'auto' }}/> </div>
           <div> <h2>We are Sorry...</h2> </div>
           <div>
            <p>The page you’re trying to access has restricted access. </p>
            <p> Please refer to your system administrator. </p>
           
            </div>
    </div>
  )
}

export default Error401