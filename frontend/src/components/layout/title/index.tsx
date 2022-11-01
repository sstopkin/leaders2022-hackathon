import React from "react";
import routerProvider from "@pankod/refine-react-router-v6";
import { TitleProps } from "@pankod/refine-core";

const { Link } = routerProvider;

export const Title: React.FC<TitleProps> = ({ collapsed }) => (
  <Link to="/">
    {collapsed ? (
      <img
        src={"/images/logo-dark-collapsed.webp"}
        alt="Refine"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 24px",
          height: "75px"
        }}
      />
    ) : (
      <img
        src={"/images/logo-dark-bar.webp"}
        alt="Refine"
        style={{
          width: "200px",
          padding: "12px 24px",
        }}
      />
    )}
  </Link>
);
