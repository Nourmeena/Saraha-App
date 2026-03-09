export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        await fn(req, res, next).catch(error => {
            return next(error,{cause:500})
        })
    }
}
//it take a function as argument
// return async function as signup, bec express route expect a function
// and wait for fn arg respond so that if error happen catch it
// error not new error to return the place of real error and not return response.js each time
// (it is promise so can connect to it other function)

export const globalErrorHandler = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
  });
};

//error middleware


export const successResponse = ({res,message="done",status=200,data={}}={}) => {
    return res.status(status).json({message,data})
}
