import { Outlet} from "react-router-dom";
import Spinner from "./Spinner";

export default function PrivateRoute({ok}) {
  return ok ? <Outlet /> : <Spinner/> ;
}