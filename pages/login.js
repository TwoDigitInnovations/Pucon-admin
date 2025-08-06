import React, { useContext, useState } from 'react'
import { MdArrowForward, MdEmail, MdPassword } from "react-icons/md";
import { login } from '../context/apiHelpers';
import Swal from 'sweetalert2';
import { useRouter } from "next/router";
import { useAppContext } from '@/context/AppContext';

function Login() {
    const router = useRouter();
    const [userDetail, setUserDetail] = useState({
        username: "",
        password: "",
    });
    const { user, setUser } = useAppContext()
    console.log(user)
    // const [user, setUser] = useContext(useAppContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                email: userDetail?.username,
                password: userDetail?.password,
            };
            const response = await login(data);

            console.log(response)
            // return
            if (response.success) {
                // setLanguages([response.data, ...languages]);
                setUser(response.user);
                setUserDetail({
                    username: "",
                    password: "",
                });
                localStorage.setItem("userDetail", JSON.stringify(response.user));
                localStorage.setItem("token", response.user.token);
                Swal.fire('Created!', 'Login Successful', 'success');

                // router.push("/languages");

                if (response.user?.type !== 'ADMIN' || !response.user.token) {
                    router.push('/login')
                    return
                } else {
                    router.push('/languages')
                }
            }

            if (response.success) {
                // setShowModal(false);
                // clearImage();
                // await loadLanguages(currentPage);
            } else {
                Swal.fire('Error!', response.message || 'Failed to save login', 'error');
            }
        } catch (err) {
            console.error('Error saving login:', err);
            Swal.fire('Error!', err.error || 'Failed to save login', 'error');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 justify-center items-center ">
            <div className="border-2 rounded-3xl border-blue-700 bg-gray-50 md:p-10 p-5 sm:w-1.5 md:w-1/3  ">
                <p className="text-black text-center md:text-4xl text-2xl font-semibold mb-10">
                    Welcome
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="flex bg-white py-2 mt-4 rounded-md border  border-blue-700 md:h-14 sm:h-10 w-64 md:min-w-full ">
                        <div className="flex md:mx-4 mx-2.5 justify-center md:h-10 sm:h-8 items-center ">
                            <div className="md:w-5 md:h-5 w-4 h-4 relative">
                                <MdEmail className="text-xl text-blue-700" />
                            </div>
                        </div>
                        <input
                            placeholder="Username"
                            className="bg-white outline-none pl-2 text-black text-xs md:text-base border-l-2 border-blue-700 md:h-10 h-5"
                            value={userDetail.username}
                            autoComplete="false"
                            onChange={(text) => {
                                setUserDetail({ ...userDetail, username: text.target.value });
                            }}
                            required
                        />
                    </div>

                    <div className="flex bg-white py-2 mt-4 rounded-md  border  border-blue-700 md:h-14 sm:h-10 min-w-full relative items-center w-64 md:min-w-full ">
                        <div className="flex md:mx-4 mx-2.5  justify-center md:h-10 sm:h-8 items-center ">
                            <div className="md:w-5 md:h-5 w-4 h-4 relative">
                                <MdPassword className="text-xl text-blue-700" />
                            </div>
                        </div>
                        <input
                            placeholder="Password"
                            type="password"
                            className="bg-white outline-none pl-2 text-black text-xs md:text-base border-l-2 border-blue-700 md:h-10 h-5"
                            value={userDetail.password}
                            autoComplete="new-password"
                            onChange={(text) => {
                                setUserDetail({ ...userDetail, password: text.target.value });
                            }}
                            required
                        />
                    </div>

                    <div className=" mt-10 grid grid-cols-2 gap-8">
                        <div className="items-start">
                            <p className="text-black text-left md:text-4xl text-2xl font-semibold ">
                                Sign in
                            </p>
                        </div>
                        <div className="flex justify-end"

                        // onClick={submit}
                        >
                            <button
                                type="submit">
                                <div className="md:w-10 md:h-10 w-8 h-8 relative bg-blue-700 rounded-full flex justify-center items-center">
                                    <MdArrowForward className="text-white w-5 h-5" />
                                </div>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
