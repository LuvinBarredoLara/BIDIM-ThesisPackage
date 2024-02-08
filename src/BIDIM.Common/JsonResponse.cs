using System.Net;

namespace BIDIM.Common
{
    [Serializable]
    public class JsonResponse
    {
        public virtual bool IsSuccess { get; set; } = false;

        public virtual int? Status { get; set; } = null;

        public virtual string? Message { get; set; }

        public virtual object? Data { get; set; }

        public virtual JsonResponse Success(string mssg,
            object? data = null)
        {
            IsSuccess = true;

            if (!string.IsNullOrEmpty(mssg))
                Message = mssg;

            if (data != null)
                Data = data;

            return this;
        }

        public virtual JsonResponse Error(string errMssg, 
            int statusCode = (int)HttpStatusCode.BadRequest,
            object? data = null)
        {
            IsSuccess = false;
            Status = statusCode;

            if (!string.IsNullOrEmpty(errMssg))
                Message = errMssg;

            if (data != null)
                Data = data;

            return this;
        }
    }
}
