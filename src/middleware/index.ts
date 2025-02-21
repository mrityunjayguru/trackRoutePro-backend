import UploadtoCloud from "./Uploadtocloud"
import FileUpload from './FileUpload';
import {userAuth} from "./auth"
export default{
    UploadtoCloud,
    FileUpload,
    isAuth:userAuth
}