import { Notyf } from "notyf";
import "notyf/notyf.min.css";

class Helpers {
  static localhost = "127.0.0.1:8000";
  static server = "";
  static basePath = `//${this.localhost}`;
  static apiUrl = `${this.basePath}/api/`;
  static googleUrl = `${this.basePath}/`;
  static ASSETS_IMAGES_PATH = "/assets/img";
  static DASHBOARD_IMAGES_PATH = "/dashboard/images";

  // static authUser = JSON.parse(localStorage.getItem("user")) ?? {};
  static getAuthUser() {
    return JSON.parse(localStorage.getItem("user")) || {};
  }
  static serverFile = (name) => {
    return `${this.basePath}/${name}`;
  };

  static refresh() {
    this.authUser = JSON.parse(localStorage.getItem("user")) ?? {};
  }


  static authHeaders = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  static authFileHeaders = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  static getAuthHeaders() {
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
  }


  static getAuthFileHeaders() {
    return {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
  }

  static getItem = (data, isJson = false) => {
    if (isJson) {
      return JSON.parse(localStorage.getItem(data));
    } else {
      return localStorage.getItem(data);
    }
  };

  static scrollToTop(smooth = true) {
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }

  static removeItem = (name) => {
    localStorage.removeItem(name);
  };

  static setItem = (key, data, isJson = false) => {
    if (isJson) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, data);
    }
  };

  static toast = (type, message) => {
    const notyf = new Notyf();
    notyf.open({
      message: message,
      type: type,
      position: { x: "right", y: "top" },
      ripple: true,
      dismissible: true,
      duration: 2000,
    });
  };

  // static toggleCSS() {
  //   const path = window.location.pathname;

  //   const mainCSS = document.getElementsByClassName("main-theme");
  //   const dashboardCSS = document.getElementsByClassName("dashboard-theme");

  //   // Preload stylesheets to avoid FOUC
  //   const preloadStyles = (styles) => {
  //     styles.forEach((style) => {
  //       const link = document.createElement("link");
  //       link.rel = "preload";
  //       link.href = style.href;
  //       link.as = "style";
  //       document.head.appendChild(link);
  //     });
  //   };

  //   if (path.includes("/user") || path.includes("/admin")) {
  //     preloadStyles(Array.from(dashboardCSS));
  //     // Disable main theme and enable dashboard theme
  //     setTimeout(() => {
  //       for (let i = 0; i < mainCSS.length; i++) {
  //         mainCSS[i].setAttribute("disabled", "true");
  //       }
  //       for (let i = 0; i < dashboardCSS.length; i++) {
  //         dashboardCSS[i].removeAttribute("disabled");
  //       }
  //     }, 0);
  //   } else {
  //     preloadStyles(Array.from(mainCSS));
  //     // Enable main theme and disable dashboard theme
  //     setTimeout(() => {
  //       for (let i = 0; i < mainCSS.length; i++) {
  //         mainCSS[i].removeAttribute("disabled");
  //       }
  //       for (let i = 0; i < dashboardCSS.length; i++) {
  //         dashboardCSS[i].setAttribute("disabled", "true");
  //       }
  //     }, 0);
  //   }
  // }

  // static loadScript(scriptName, dashboard = false) {
  //   return new Promise((resolve, reject) => {
  //     const scriptPath = `/${
  //       dashboard ? "dashboard" : "assets"
  //     }/js/${scriptName}`;
  //     const script = document.createElement("script");
  //     script.src = scriptPath;
  //     script.async = true;

  //     script.onload = () => resolve(script); // Resolve the promise once the script is loaded
  //     script.onerror = () =>
  //       reject(new Error(`Script load error: ${scriptPath}`));

  //     document.body.appendChild(script);
  //   });
  // }
}

export default Helpers;
