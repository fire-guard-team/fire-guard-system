import React, {
    type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface Props<T> {
  title: string;
  inputs: Array<{
    label: string;
    placeholder?: string;
    type: string;
    name: string;
  }>;
  btn: string;
  underBtn: { Link: { url: string; content: string } };
  setData: Dispatch<SetStateAction<T>>;
  loading: boolean;
  onSubmit?: () => void;
}

const LoginForm = <T extends Record<string, any>>({
  title,
  inputs,
  btn,
  underBtn,
  setData,
  loading,
  onSubmit,
}: Props<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <div className="w-full max-w-xl rounded-[32px] bg-white/60 backdrop-blur-md shadow-2xl px-10 py-10 sm:px-14 sm:py-12 text-center">
      <h1 className="font-bold text-3xl sm:text-4xl text-[#031B4E] leading-tight mb-8">
        {title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {inputs.map((input, index) => (
          <div key={index}>
            <label
              className="block mb-2 text-sm font-semibold text-[#031B4E]"
              htmlFor={`input${index}`}
            >
              {input.label}
            </label>

            <div className="relative">
              <input
                id={`input${index}`}
                name={input.name}
                type={
                  input.type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : input.type
                }
                placeholder={input.placeholder}
                onChange={handleChange}
                className="block h-11 w-full pl-3 pr-10 border rounded-md border-gray-300 bg-white text-sm outline-none focus:border-[#4880FF]"
              />

              {input.type === "password" && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-11 rounded-md bg-[#00C853] text-white font-semibold hover:bg-[#00b34b] transition disabled:opacity-70"
        >
          {loading ? "Loading..." : btn}
        </button>

        <div className="flex justify-center mt-4">
          <Link
            className="text-sm font-semibold text-[#031B4E] hover:underline"
            to={underBtn.Link.url}
          >
            {underBtn.Link.content}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
