
// "use client"; // Required in app directory structure (Next.js 13+)
import { useEffect } from "react";
import { useRouter } from "next/router";

const isAuth = (Component) => {
    // function IsAuth(props) {
    //     const router = useRouter();
    //     console.log(router)
    //     let auth = false;
    //     let user
    //     if (typeof window !== "undefined") {
    //         user = localStorage.getItem("userDetail");
    //     }
    //     console.log(user)
    //     if (user) {
    //         const u = JSON.parse(user)
    //         console.log(u)
    //         if (u?.type !== 'ADMIN' || !u.token) {
    //             auth = u?.token && (u?.type === 'ADMIN') ? true : false
    //             return
    //         }
    //         // if (router?.pathname === '/languages' || router?.pathname === '/countries' || router?.pathname === '/supercategories' || router?.pathname === '/categories' || router?.pathname === '/subcategories' || router?.pathname === '/content') {
    //         //     auth = token && (u?.type === 'ADMIN') ? true : false
    //         // } else {
    //         //     auth = token && u?.type === 'ADMIN' ? true : false
    //         // }
    //         if (!auth) {
    //             localStorage.clear();
    //             router.replace('/login')
    //         }
    //     }

    //     useEffect(() => {
    //         IsAuth()
    //     }, []);

    //     return <Component {...props} />;
    // };

    return function IsAuth(props) {
        const router = useRouter();
        console.log(router)
        let auth = false;
        let user
        if (typeof window !== "undefined") {
            user = localStorage.getItem("userDetail");
        }
        if (user) {
            const u = JSON.parse(user)
            const token = localStorage.getItem("token");
            if (router?.pathname === '/languages' || router?.pathname === '/countries' || router?.pathname === '/supercategories' || router?.pathname === '/categories' || router?.pathname === '/subcategories' || router?.pathname === '/content') {
                auth = token && (u?.type === 'ADMIN') ? true : false
            } else {
                auth = token && u?.type === 'ADMIN' ? true : false
            }
        }
        useEffect(() => {
            if (!auth) {
                localStorage.clear();
                router.replace('/login')
            }
        }, []);

        return <Component {...props} />;
    };
}

export default isAuth