// /* eslint-disable react-hooks/exhaustive-deps */
// import { Outlet, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getCookie, showToast } from "../utils/common";
// import UserService from "../services/UserService";
// import { useAppDispatch } from "../store";
// import { setUser } from "../store/slices/userSlice";

// function AuthCheckerLayout() {
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const [isChecking, setIsChecking] = useState(false);

//   useEffect(() => {
//     const getDetailEmployeeInfo = async () => {
//       if (isChecking) return;
//       setIsChecking(true);
//       const token = getCookie("token");
//       try {
//         const response = await UserService.info(token);
//         if (response.code === 200 && response.result) {
//           dispatch(
//             setUser({
//               ...response.result,
//               token,
//             })
//           );
//         } else {
//           showToast("Bạn không phải là nhân viên của tổ chức này!", "warning");
//         }
//       } catch {
//         showToast("Bạn không phải là nhân viên của tổ chức này!", "warning");
//       }
//       setIsChecking(false);
//     };
//     getDetailEmployeeInfo();
//   }, [location]);

//   return <Outlet />;
// }

// export default AuthCheckerLayout;
