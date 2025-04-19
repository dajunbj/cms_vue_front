import axios from 'axios';

export async function authRights(authData = new Map()){
    const right = sessionStorage.getItem("right");
    const id = sessionStorage.getItem("id");
    if(right === "社員"){
      authData.set("auth","1");
      authData.set("id",id);
      return authData;
    }else if(right === "営業員"){
      authData.set("auth","2");
      authData.set("id",id);
      return authData;
    }else if(right === "営業組長"){
      const respone = await axios.get(`/customer/responsibleDetail/${id}`);
      authData.set("auth","3");
      authData.set("id",id);
      authData.set("employee",respone.data.employee);
      return authData;
    }
    else{
      authData.set("auth","4");
      authData.set("id",id);
      return authData;
    }
}