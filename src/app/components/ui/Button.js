"use client";

import React from "react";

const Button = ({ children, href, className = "", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md px-5 py-2 font-medium text-white bg-accent shadow-md transition-all hover:scale-105 active:scale-95";

  const Tag = href ? "a" : "button";
  const tagProps = href ? { href, ...props } : { ...props };

  return (
    <Tag {...tagProps} className={`${baseClasses} ${className}`}>
      {children}
    </Tag>
  );
};

export default Button;
