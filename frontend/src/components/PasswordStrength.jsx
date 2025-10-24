import React from "react";

export default function PasswordStrength({ password }) {
  const checks = [
    { regex: /.{8,}/, label: "At least 8 characters" },
    { regex: /[A-Z]/, label: "One uppercase letter" },
    { regex: /[a-z]/, label: "One lowercase letter" },
    { regex: /\d/, label: "One number" },
    { regex: /[@$!%*?&]/, label: "One special character" },
  ];

  return (
    <div className="mt-2">
      {checks.map((check, idx) => (
        <p
          key={idx}
          className={`text-sm ${
            check.regex.test(password) ? "text-green-600" : "text-red-500"
          }`}
        >
          {check.label}
        </p>
      ))}
    </div>
  );
}
