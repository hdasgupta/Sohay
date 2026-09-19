export function errorHandler(error,req,res,next){
  console.error('[backend] unhandled error',error);
  if(res.headersSent) return next(error);
  const status=error.status||500;
  res.status(status).json({success:false,message:status===500?'Unexpected server error':error.message});
}
