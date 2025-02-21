import multer from 'multer';
const FileUpload = (key: any | Array<Object>, multiple: boolean = false) => {
  if (typeof key == 'object' && key.length > 0) {
    return multer().fields(key);
  } else if (multiple) {
    return multer().array(key);
  } else {
    return multer().single(key);
  }
};
export default FileUpload;