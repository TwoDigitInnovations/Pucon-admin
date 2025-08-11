import axios from "axios";
// const ConstantsUrl = "http://localhost:3000/api/";

// const ConstantsUrl = "https://pucon-backend.onrender.com/api/";

const ConstantsUrl = "https://apis.travelertips.cl/api/";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== "undefined") {
      if (!isRedirecting) {
        isRedirecting = true;


        localStorage.removeItem("userDetail");
        localStorage.removeItem("token");


        window.dispatchEvent(new Event('storage'));
        document.dispatchEvent(new Event('auth-state-changed'));

        if (window.router && !window.router.pathname.includes("signIn")) {
          window.router.push("/auth/signIn");
        } else {
          window.location.href = "/auth/signIn";
        }

        setTimeout(() => {
          isRedirecting = false;
        }, 2000);
      }

      return Promise.resolve({
        data: { success: false, redirect: true }
      });
    }
    return Promise.reject(error);
  }
);




function notifyAuthChange() {

  window.dispatchEvent(new Event('storage'));
  document.dispatchEvent(new Event('auth-state-changed'));
}

const handleTokenExpiration = (router) => {
  if (isRedirecting) return true;

  console.log("Token expired, logging out user...");
  isRedirecting = true;

  try {
    // Clear user data
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");

    // Notify all components about auth change
    notifyAuthChange();

    // Navigate to login page if not already there
    if (router && !router.pathname.includes("signIn")) {
      router.push("/auth/signIn");
    }

    setTimeout(() => {
      isRedirecting = false;
    }, 2000);

    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    isRedirecting = false;
    return false;
  }
};
export const setGlobalRouter = (router) => {
  if (typeof window !== "undefined") {
    window.router = router;
  }
};


let isRedirecting = false;


// const handleTokenExpiration = (router) => {
//   if (isRedirecting) return true;

//   console.log("Token expired, logging out user...");
//   isRedirecting = true;

//   try {

//     localStorage.removeItem("userDetail");
//     localStorage.removeItem("token");

//     window.dispatchEvent(new Event('storage'));
//     window.dispatchEvent(new Event('auth-state-changed'));


//     if (router && !router.pathname.includes("signIn")) {
//       router.push("/auth/signIn");
//     }


//     setTimeout(() => {
//       isRedirecting = false;
//     }, 2000);

//     return true;
//   } catch (error) {
//     console.error("Error during logout:", error);
//     isRedirecting = false;
//     return false;
//   }
// };

function Api(method, url, data, router, params) {
  return new Promise(function (resolve, reject) {

    if (isRedirecting) {
      resolve({ success: false, redirect: true });
      return;
    }

    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: { Authorization: `jwt ${token}` },
      params
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              handleTokenExpiration(router);
              return resolve({ success: false, redirect: true });
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}


function ApiFormData(method, url, data, router) {
  return new Promise(function (resolve, reject) {

    if (isRedirecting) {
      resolve({ redirect: true, message: "Logging you out. Please wait..." });
      return;
    }

    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    console.log('ApiFormData request:', {
      method,
      url: ConstantsUrl + url,
      dataType: data instanceof FormData ? 'FormData' : typeof data,
      hasToken: !!token,
      dataEntries: data instanceof FormData ? Array.from(data.entries()).map(([key, value]) => ({
        key,
        type: value instanceof File ? 'File' : typeof value,
        size: value instanceof File ? value.size : null,
        name: value instanceof File ? value.name : null
      })) : null
    });

    // Add progress tracking for uploads
    const config = {
      method,
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 second timeout
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      }
    };

    axios(config).then(
      (res) => {
        console.log('ApiFormData success:', res.data);
        resolve(res.data);
      },
      (err) => {
        console.error('ApiFormData error:', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            timeout: err.config?.timeout
          }
        });

        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              // Use the helper function
              if (handleTokenExpiration(router)) {
                return resolve({ redirect: true, message: "Session expired. Please login again." });
              }
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

const timeSince = (date) => {
  date = new Date(date);
  const diff = new Date().valueOf() - date.valueOf();
  const seconds = Math.floor(diff / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " Years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Months" : " Month") +
      " ago"
    );
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Weeks" : " Week") +
      " ago"
    );
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Days" : " Day") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Hours" : " Hour") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Min" : " min") +
      " ago"
    );
  }
  return "Just now";
};

export { Api, timeSince, ApiFormData };
