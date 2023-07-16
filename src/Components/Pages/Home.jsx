import React from "react";

import Main from "../Components/Main";


const Home = () => {
  return (
    <div className="d-flex" style={{flexDirection:"column", height:"100vh", justifyContent:"space-between"}}>
      <div className="container-fluid " >
        <Main />
      </div>
    </div>
  );
};

export default Home;