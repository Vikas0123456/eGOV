import React, { useEffect } from "react";
import { Navigate, Route } from "react-router-dom";

const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return (<> <Component {...props} /> </>);
      }}
    />
  );
};

export { AccessRoute };