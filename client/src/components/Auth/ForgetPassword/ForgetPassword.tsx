// src/app/Auth/ForgetPassword.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Mock – ما في API حقيقية
    alert("If this email exists, a reset link will be sent (mock).");
    navigate("/");
  };

  return (
    <div className="w-full max-w-xl rounded-[32px] bg-white/60 backdrop-blur-md shadow-2xl px-10 py-10 sm:px-14 sm:py-12 text-center">
      <h1 className="font-bold text-3xl sm:text-4xl text-[#031B4E] leading-tight mb-4">
        Forgot Password
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Enter your email address and we&apos;ll send you instructions to reset
        your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-semibold text-[#031B4E]"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            className="block h-11 w-full pl-3 border rounded-md border-gray-300 bg-white text-sm outline-none focus:border-[#4880FF]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full h-11 rounded-md bg-[#00C853] text-white font-semibold hover:bg-[#00b34b] transition"
        >
          Send reset link
        </button>

        <div className="flex justify-center mt-4">
          <Link
            to="/"
            className="text-sm font-semibold text-[#031B4E] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;
