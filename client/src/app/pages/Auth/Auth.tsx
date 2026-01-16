import { Outlet } from "react-router-dom"
import FireImage from "/assets/images/Fire.png"; 

const Auth = () => {
  return (
    <div className="relative flex justify-center items-center h-screen">
        <img src={FireImage} alt="FireImage" className="absolute top-0 left-0 z-[-1] h-screen w-screen" />
      <Outlet />
    </div>  
  )
}

export default Auth
