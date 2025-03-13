import { useEffect, useState } from "react";
import Helpers from "../Config/Helpers.js";
import { Outlet, useLocation } from "react-router-dom";
// import { Header, Footer } from "../components";
// import Loader from "../components/Common/Loader.jsx";

const Layout = () => {
  const location = useLocation();
  const [loader, setLoader] = useState(true);

//   useEffect(() => {
//     Helpers.toggleCSS();
//     Helpers.scrollToTop();
//   }, [location.pathname]);

//   useEffect(() => {
//     Helpers.loadScript("modernizr-3.5.0.min.js")
//       .then(() => Helpers.loadScript("jquery-1.12.4.min.js"))
//       .then(() => Helpers.loadScript("popper.min.js"))
//       .then(() => Helpers.loadScript("bootstrap.min.js"))
//       .then(() => Helpers.loadScript("owl.carousel.min.js"))
//       .then(() => Helpers.loadScript("isotope.pkgd.min.js"))
//       .then(() => Helpers.loadScript("ajax-form.js"))
//       .then(() => Helpers.loadScript("waypoints.min.js"))
//       .then(() => Helpers.loadScript("jquery.counterup.min.js"))
//       .then(() => Helpers.loadScript("imagesloaded.pkgd.min.js"))
//       .then(() => Helpers.loadScript("scrollIt.js"))
//       .then(() => Helpers.loadScript("jquery.scrollUp.min.js"))
//       .then(() => Helpers.loadScript("wow.min.js"))
//       .then(() => Helpers.loadScript("nice-select.min.js"))
//       .then(() => Helpers.loadScript("jquery.slicknav.min.js"))
//       .then(() => Helpers.loadScript("jquery.magnific-popup.min.js"))
//       .then(() => Helpers.loadScript("plugins.js"))
//       .then(() => Helpers.loadScript("range.js"))
//       .then(() => Helpers.loadScript("jquery.ajaxchimp.min.js"))
//       .then(() => Helpers.loadScript("jquery.form.js"))
//       .then(() => Helpers.loadScript("jquery.validate.min.js"))
//       .then(() => Helpers.loadScript("contact.js"))
//       .then(() => Helpers.loadScript("mail-script.js"))
//       .then(() => Helpers.loadScript("main.js"))
//       .then(() => {
//         if ($("#slider-range").length) {
//           $("#slider-range").slider({
//             range: true,
//             min: 0,
//             max: 24600,
//             values: [750, 24600],
//             slide: function (event, ui) {
//               $("#amount").val(`$${ui.values[0]} - $${ui.values[1]}/ Year`);
//             },
//           });
//           $("#amount").val(`$${$("#slider-range").slider("values", 0)} - $${$("#slider-range").slider("values", 1)}/ Year`);
//         }
//       })
//       .finally(() => {
//         setTimeout(() => {
//           setLoader(false);
//         }, 500); // Show loader for at least 1 second
//       });
//   }, [location]);

//   if (loader) {
//     return <Loader />;
//   }

  return (
    <div>
      {/* <Header /> */}
      {/* <Outlet /> */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
