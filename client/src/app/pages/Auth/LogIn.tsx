// src/app/Auth/LogIn.tsx
import { useNavigate } from "react-router-dom";
import LoginForm from "../../../components/Auth/LoginForm/LoginForm";
import { useState } from "react";

interface LogInData {
  email: string;
  password: string;
}

const LogIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<LogInData>({
    email: "",
    password: "",
  });

  const inputs = [
    {
      label: "Username",
      placeholder: "Enter your username or email",
      type: "email",
      name: "email",
    },
    {
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      name: "password",
    },
  ];

  const handleSubmit = () => {
    if (!data.email || !data.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("mockUser", JSON.stringify(data));
      navigate("/dashboard");
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <LoginForm<LogInData>
        title="Welcome To Fire Guard System"
        inputs={inputs}
        btn="Login"
        underBtn={{
          Link: { url: "/forget-password", content: "Forgot password?" },
        }}
        setData={setData}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default LogIn;
