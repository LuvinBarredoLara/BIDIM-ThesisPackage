import Swal from "sweetalert2";

export default class SweetAlerts {
    static AskQuestion(title: string, mssg: string) {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: mssg,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ok',
            allowEscapeKey: false,
            allowOutsideClick: false
        });
    }

    static ShowMessage(type: any, title: string, mssg: string){
        return Swal.fire({
            icon: type,
            title: title,
            text: mssg,
            allowEscapeKey: false,
            allowOutsideClick: false
        });
    }

    static ShowToast(iconStr: any, title: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: iconStr,
            title: title
          });
    }

    static ShowLoadingToast() {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: 'warning',
            title: 'Page is still loading'
          });
    }
    
    static ShowWarningToast(str: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: 'warning',
            title: str
          });
    }

    static ShowInfoToast(str: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: 'info',
            title: str
          });
    }

    static ShowSuccessToast(str: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: 'success',
            title: str
          });
    }

    static ShowErrorToast(str: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
         return Toast.fire({
            icon: 'error',
            title: str
          });
    }
}